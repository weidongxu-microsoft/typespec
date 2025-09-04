// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

package com.microsoft.typespec.http.client.generator.mgmt.template;

import com.azure.ai.inference.ChatCompletionsClient;
import com.azure.ai.inference.ChatCompletionsClientBuilder;
import com.azure.ai.inference.models.ChatChoice;
import com.azure.ai.inference.models.ChatCompletions;
import com.azure.ai.inference.models.ChatCompletionsOptions;
import com.azure.ai.inference.models.ChatRequestMessage;
import com.azure.ai.inference.models.ChatRequestSystemMessage;
import com.azure.ai.inference.models.ChatRequestUserMessage;
import com.azure.ai.inference.models.ChatResponseMessage;
import com.azure.core.credential.AzureKeyCredential;
import com.azure.core.util.Configuration;
import com.azure.core.util.CoreUtils;
import com.microsoft.typespec.http.client.generator.core.model.clientmodel.ClientMethod;
import com.microsoft.typespec.http.client.generator.core.model.clientmodel.MethodGroupClient;
import com.microsoft.typespec.http.client.generator.core.model.clientmodel.ProxyMethod;
import com.microsoft.typespec.http.client.generator.core.util.TemplateUtil;
import com.microsoft.typespec.http.client.generator.mgmt.model.clientmodel.FluentStatic;
import com.microsoft.typespec.http.client.generator.mgmt.model.projectmodel.CodeSample;
import com.microsoft.typespec.http.client.generator.mgmt.model.projectmodel.FluentProject;
import com.microsoft.typespec.http.client.generator.mgmt.util.FluentUtils;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class ReadmeTemplate extends com.microsoft.typespec.http.client.generator.core.template.ReadmeTemplate {

    public String write(FluentProject project) {
        return write(project, Collections.emptyList());
    }

    public String write(FluentProject project, List<MethodGroupClient> mgs) {
        StringBuilder sampleCodesBuilder = new StringBuilder();
        for (CodeSample codeSample : project.getCodeSamples()) {
            if (codeSample.getCode() != null) {
                sampleCodesBuilder.append("```java\n").append(codeSample.getCode()).append("```\n");
            }
        }

        if (project.isGenerateSamples() && project.getSdkRepositoryUri().isPresent()) {
            sampleCodesBuilder.append("[Code snippets and samples]")
                .append("(")
                .append(project.getSdkRepositoryUri().get())
                .append("/SAMPLE.md")
                .append(")")
                .append("\n");
        }

        String content
            = FluentUtils.loadTextFromResource("Readme.txt", TemplateUtil.SERVICE_NAME, project.getServiceName(),
                TemplateUtil.SERVICE_DESCRIPTION, project.getServiceDescriptionForMarkdown(), TemplateUtil.GROUP_ID,
                project.getGroupId(), TemplateUtil.ARTIFACT_ID, project.getArtifactId(), TemplateUtil.ARTIFACT_VERSION,
                project.getVersion(), TemplateUtil.MANAGER_CLASS, FluentStatic.getFluentManager().getType().getName(),
                TemplateUtil.SAMPLE_CODES, sampleCodesBuilder.toString());

        if (Configuration.getGlobalConfiguration().contains("AZURE_API_KEY") && !CoreUtils.isNullOrEmpty(mgs)) {
            ChatCompletionsClient client = new ChatCompletionsClientBuilder()
                .credential(new AzureKeyCredential(Configuration.getGlobalConfiguration().get("AZURE_API_KEY")))
                .endpoint(Configuration.getGlobalConfiguration().get("AZURE_API_BASE"))
                .buildClient();

            StringBuilder clientsAndApis = new StringBuilder();
            for (MethodGroupClient mg : mgs) {
                Set<String> routes = new HashSet<>();
                clientsAndApis.append(mg.getClassBaseName()).append(System.lineSeparator());
                for (ClientMethod m : mg.getClientMethods()) {
                    ProxyMethod p = m.getProxyMethod();
                    String route = p.getHttpMethod() + " " + p.getUrlPath();
                    if (routes.add(route)) {
                        clientsAndApis.append("- ")
                            .append(p.getReturnType())
                            .append(" ")
                            .append(p.getName())
                            .append("(")
                            .append(p.getAllParameters()
                                .stream()
                                .map(param -> param.getClientType() + " " + param.getName())
                                .collect(Collectors.joining(", ")))
                            .append(")");
                        clientsAndApis.append("  ").append(p.getDescription());
                    }
                }
            }

            String prompt
                = "Summarize the key concept for the SDK. Below is the clients and APIs in the client. Output in markdown. If need to add section, start with ###."
                    + "\n\n" + clientsAndApis;

            List<ChatRequestMessage> chatMessages = new ArrayList<>();
            chatMessages.add(new ChatRequestSystemMessage("You are an expert Java SDK developer."));
            chatMessages.add(new ChatRequestUserMessage(prompt));

            ChatCompletions chatCompletions = client.complete(new ChatCompletionsOptions(chatMessages));
            for (ChatChoice choice : chatCompletions.getChoices()) {
                ChatResponseMessage message = choice.getMessage();
                String output = message.getContent();

                if (!CoreUtils.isNullOrEmpty(output)) {
                    content = content.replace("## Key concepts", "## Key concepts\n\n" + output);
                }

                break;
            }
        }

        return content;
    }
}
