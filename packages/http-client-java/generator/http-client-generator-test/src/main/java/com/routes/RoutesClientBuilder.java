// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// Code generated by Microsoft (R) TypeSpec Code Generator.

package com.routes;

import com.azure.core.annotation.Generated;
import com.azure.core.annotation.ServiceClientBuilder;
import com.azure.core.client.traits.ConfigurationTrait;
import com.azure.core.client.traits.EndpointTrait;
import com.azure.core.client.traits.HttpTrait;
import com.azure.core.http.HttpClient;
import com.azure.core.http.HttpHeaders;
import com.azure.core.http.HttpPipeline;
import com.azure.core.http.HttpPipelineBuilder;
import com.azure.core.http.HttpPipelinePosition;
import com.azure.core.http.policy.AddDatePolicy;
import com.azure.core.http.policy.AddHeadersFromContextPolicy;
import com.azure.core.http.policy.AddHeadersPolicy;
import com.azure.core.http.policy.HttpLoggingPolicy;
import com.azure.core.http.policy.HttpLogOptions;
import com.azure.core.http.policy.HttpPipelinePolicy;
import com.azure.core.http.policy.HttpPolicyProviders;
import com.azure.core.http.policy.RequestIdPolicy;
import com.azure.core.http.policy.RetryOptions;
import com.azure.core.http.policy.RetryPolicy;
import com.azure.core.http.policy.UserAgentPolicy;
import com.azure.core.util.ClientOptions;
import com.azure.core.util.Configuration;
import com.azure.core.util.CoreUtils;
import com.azure.core.util.builder.ClientBuilderUtil;
import com.azure.core.util.logging.ClientLogger;
import com.azure.core.util.serializer.JacksonAdapter;
import com.routes.implementation.RoutesClientImpl;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * A builder for creating a new instance of the RoutesClient type.
 */
@ServiceClientBuilder(
    serviceClients = {
        RoutesClient.class,
        PathParametersClient.class,
        PathParametersReservedExpansionClient.class,
        PathParametersSimpleExpansionStandardClient.class,
        PathParametersSimpleExpansionExplodeClient.class,
        PathParametersPathExpansionStandardClient.class,
        PathParametersPathExpansionExplodeClient.class,
        PathParametersLabelExpansionStandardClient.class,
        PathParametersLabelExpansionExplodeClient.class,
        PathParametersMatrixExpansionStandardClient.class,
        PathParametersMatrixExpansionExplodeClient.class,
        QueryParametersClient.class,
        QueryParametersQueryExpansionStandardClient.class,
        QueryParametersQueryExpansionExplodeClient.class,
        QueryParametersQueryContinuationStandardClient.class,
        QueryParametersQueryContinuationExplodeClient.class,
        InInterfaceClient.class,
        RoutesAsyncClient.class,
        PathParametersAsyncClient.class,
        PathParametersReservedExpansionAsyncClient.class,
        PathParametersSimpleExpansionStandardAsyncClient.class,
        PathParametersSimpleExpansionExplodeAsyncClient.class,
        PathParametersPathExpansionStandardAsyncClient.class,
        PathParametersPathExpansionExplodeAsyncClient.class,
        PathParametersLabelExpansionStandardAsyncClient.class,
        PathParametersLabelExpansionExplodeAsyncClient.class,
        PathParametersMatrixExpansionStandardAsyncClient.class,
        PathParametersMatrixExpansionExplodeAsyncClient.class,
        QueryParametersAsyncClient.class,
        QueryParametersQueryExpansionStandardAsyncClient.class,
        QueryParametersQueryExpansionExplodeAsyncClient.class,
        QueryParametersQueryContinuationStandardAsyncClient.class,
        QueryParametersQueryContinuationExplodeAsyncClient.class,
        InInterfaceAsyncClient.class })
public final class RoutesClientBuilder implements HttpTrait<RoutesClientBuilder>,
    ConfigurationTrait<RoutesClientBuilder>, EndpointTrait<RoutesClientBuilder> {
    @Generated
    private static final String SDK_NAME = "name";

    @Generated
    private static final String SDK_VERSION = "version";

    @Generated
    private static final Map<String, String> PROPERTIES = CoreUtils.getProperties("routes.properties");

    @Generated
    private final List<HttpPipelinePolicy> pipelinePolicies;

    /**
     * Create an instance of the RoutesClientBuilder.
     */
    @Generated
    public RoutesClientBuilder() {
        this.pipelinePolicies = new ArrayList<>();
    }

    /*
     * The HTTP pipeline to send requests through.
     */
    @Generated
    private HttpPipeline pipeline;

    /**
     * {@inheritDoc}.
     */
    @Generated
    @Override
    public RoutesClientBuilder pipeline(HttpPipeline pipeline) {
        if (this.pipeline != null && pipeline == null) {
            LOGGER.atInfo().log("HttpPipeline is being set to 'null' when it was previously configured.");
        }
        this.pipeline = pipeline;
        return this;
    }

    /*
     * The HTTP client used to send the request.
     */
    @Generated
    private HttpClient httpClient;

    /**
     * {@inheritDoc}.
     */
    @Generated
    @Override
    public RoutesClientBuilder httpClient(HttpClient httpClient) {
        this.httpClient = httpClient;
        return this;
    }

    /*
     * The logging configuration for HTTP requests and responses.
     */
    @Generated
    private HttpLogOptions httpLogOptions;

    /**
     * {@inheritDoc}.
     */
    @Generated
    @Override
    public RoutesClientBuilder httpLogOptions(HttpLogOptions httpLogOptions) {
        this.httpLogOptions = httpLogOptions;
        return this;
    }

    /*
     * The client options such as application ID and custom headers to set on a request.
     */
    @Generated
    private ClientOptions clientOptions;

    /**
     * {@inheritDoc}.
     */
    @Generated
    @Override
    public RoutesClientBuilder clientOptions(ClientOptions clientOptions) {
        this.clientOptions = clientOptions;
        return this;
    }

    /*
     * The retry options to configure retry policy for failed requests.
     */
    @Generated
    private RetryOptions retryOptions;

    /**
     * {@inheritDoc}.
     */
    @Generated
    @Override
    public RoutesClientBuilder retryOptions(RetryOptions retryOptions) {
        this.retryOptions = retryOptions;
        return this;
    }

    /**
     * {@inheritDoc}.
     */
    @Generated
    @Override
    public RoutesClientBuilder addPolicy(HttpPipelinePolicy customPolicy) {
        Objects.requireNonNull(customPolicy, "'customPolicy' cannot be null.");
        pipelinePolicies.add(customPolicy);
        return this;
    }

    /*
     * The configuration store that is used during construction of the service client.
     */
    @Generated
    private Configuration configuration;

    /**
     * {@inheritDoc}.
     */
    @Generated
    @Override
    public RoutesClientBuilder configuration(Configuration configuration) {
        this.configuration = configuration;
        return this;
    }

    /*
     * The service endpoint
     */
    @Generated
    private String endpoint;

    /**
     * {@inheritDoc}.
     */
    @Generated
    @Override
    public RoutesClientBuilder endpoint(String endpoint) {
        this.endpoint = endpoint;
        return this;
    }

    /*
     * The retry policy that will attempt to retry failed requests, if applicable.
     */
    @Generated
    private RetryPolicy retryPolicy;

    /**
     * Sets The retry policy that will attempt to retry failed requests, if applicable.
     * 
     * @param retryPolicy the retryPolicy value.
     * @return the RoutesClientBuilder.
     */
    @Generated
    public RoutesClientBuilder retryPolicy(RetryPolicy retryPolicy) {
        this.retryPolicy = retryPolicy;
        return this;
    }

    /**
     * Builds an instance of RoutesClientImpl with the provided parameters.
     * 
     * @return an instance of RoutesClientImpl.
     */
    @Generated
    private RoutesClientImpl buildInnerClient() {
        this.validateClient();
        HttpPipeline localPipeline = (pipeline != null) ? pipeline : createHttpPipeline();
        String localEndpoint = (endpoint != null) ? endpoint : "http://localhost:3000";
        RoutesClientImpl client
            = new RoutesClientImpl(localPipeline, JacksonAdapter.createDefaultSerializerAdapter(), localEndpoint);
        return client;
    }

    @Generated
    private void validateClient() {
        // This method is invoked from 'buildInnerClient'/'buildClient' method.
        // Developer can customize this method, to validate that the necessary conditions are met for the new client.
    }

    @Generated
    private HttpPipeline createHttpPipeline() {
        Configuration buildConfiguration
            = (configuration == null) ? Configuration.getGlobalConfiguration() : configuration;
        HttpLogOptions localHttpLogOptions = this.httpLogOptions == null ? new HttpLogOptions() : this.httpLogOptions;
        ClientOptions localClientOptions = this.clientOptions == null ? new ClientOptions() : this.clientOptions;
        List<HttpPipelinePolicy> policies = new ArrayList<>();
        String clientName = PROPERTIES.getOrDefault(SDK_NAME, "UnknownName");
        String clientVersion = PROPERTIES.getOrDefault(SDK_VERSION, "UnknownVersion");
        String applicationId = CoreUtils.getApplicationId(localClientOptions, localHttpLogOptions);
        policies.add(new UserAgentPolicy(applicationId, clientName, clientVersion, buildConfiguration));
        policies.add(new RequestIdPolicy());
        policies.add(new AddHeadersFromContextPolicy());
        HttpHeaders headers = CoreUtils.createHttpHeadersFromClientOptions(localClientOptions);
        if (headers != null) {
            policies.add(new AddHeadersPolicy(headers));
        }
        this.pipelinePolicies.stream()
            .filter(p -> p.getPipelinePosition() == HttpPipelinePosition.PER_CALL)
            .forEach(p -> policies.add(p));
        HttpPolicyProviders.addBeforeRetryPolicies(policies);
        policies.add(ClientBuilderUtil.validateAndGetRetryPolicy(retryPolicy, retryOptions, new RetryPolicy()));
        policies.add(new AddDatePolicy());
        this.pipelinePolicies.stream()
            .filter(p -> p.getPipelinePosition() == HttpPipelinePosition.PER_RETRY)
            .forEach(p -> policies.add(p));
        HttpPolicyProviders.addAfterRetryPolicies(policies);
        policies.add(new HttpLoggingPolicy(localHttpLogOptions));
        HttpPipeline httpPipeline = new HttpPipelineBuilder().policies(policies.toArray(new HttpPipelinePolicy[0]))
            .httpClient(httpClient)
            .clientOptions(localClientOptions)
            .build();
        return httpPipeline;
    }

    /**
     * Builds an instance of RoutesAsyncClient class.
     * 
     * @return an instance of RoutesAsyncClient.
     */
    @Generated
    public RoutesAsyncClient buildAsyncClient() {
        return new RoutesAsyncClient(buildInnerClient());
    }

    /**
     * Builds an instance of PathParametersAsyncClient class.
     * 
     * @return an instance of PathParametersAsyncClient.
     */
    @Generated
    public PathParametersAsyncClient buildPathParametersAsyncClient() {
        return new PathParametersAsyncClient(buildInnerClient().getPathParameters());
    }

    /**
     * Builds an instance of PathParametersReservedExpansionAsyncClient class.
     * 
     * @return an instance of PathParametersReservedExpansionAsyncClient.
     */
    @Generated
    public PathParametersReservedExpansionAsyncClient buildPathParametersReservedExpansionAsyncClient() {
        return new PathParametersReservedExpansionAsyncClient(buildInnerClient().getPathParametersReservedExpansions());
    }

    /**
     * Builds an instance of PathParametersSimpleExpansionStandardAsyncClient class.
     * 
     * @return an instance of PathParametersSimpleExpansionStandardAsyncClient.
     */
    @Generated
    public PathParametersSimpleExpansionStandardAsyncClient buildPathParametersSimpleExpansionStandardAsyncClient() {
        return new PathParametersSimpleExpansionStandardAsyncClient(
            buildInnerClient().getPathParametersSimpleExpansionStandards());
    }

    /**
     * Builds an instance of PathParametersSimpleExpansionExplodeAsyncClient class.
     * 
     * @return an instance of PathParametersSimpleExpansionExplodeAsyncClient.
     */
    @Generated
    public PathParametersSimpleExpansionExplodeAsyncClient buildPathParametersSimpleExpansionExplodeAsyncClient() {
        return new PathParametersSimpleExpansionExplodeAsyncClient(
            buildInnerClient().getPathParametersSimpleExpansionExplodes());
    }

    /**
     * Builds an instance of PathParametersPathExpansionStandardAsyncClient class.
     * 
     * @return an instance of PathParametersPathExpansionStandardAsyncClient.
     */
    @Generated
    public PathParametersPathExpansionStandardAsyncClient buildPathParametersPathExpansionStandardAsyncClient() {
        return new PathParametersPathExpansionStandardAsyncClient(
            buildInnerClient().getPathParametersPathExpansionStandards());
    }

    /**
     * Builds an instance of PathParametersPathExpansionExplodeAsyncClient class.
     * 
     * @return an instance of PathParametersPathExpansionExplodeAsyncClient.
     */
    @Generated
    public PathParametersPathExpansionExplodeAsyncClient buildPathParametersPathExpansionExplodeAsyncClient() {
        return new PathParametersPathExpansionExplodeAsyncClient(
            buildInnerClient().getPathParametersPathExpansionExplodes());
    }

    /**
     * Builds an instance of PathParametersLabelExpansionStandardAsyncClient class.
     * 
     * @return an instance of PathParametersLabelExpansionStandardAsyncClient.
     */
    @Generated
    public PathParametersLabelExpansionStandardAsyncClient buildPathParametersLabelExpansionStandardAsyncClient() {
        return new PathParametersLabelExpansionStandardAsyncClient(
            buildInnerClient().getPathParametersLabelExpansionStandards());
    }

    /**
     * Builds an instance of PathParametersLabelExpansionExplodeAsyncClient class.
     * 
     * @return an instance of PathParametersLabelExpansionExplodeAsyncClient.
     */
    @Generated
    public PathParametersLabelExpansionExplodeAsyncClient buildPathParametersLabelExpansionExplodeAsyncClient() {
        return new PathParametersLabelExpansionExplodeAsyncClient(
            buildInnerClient().getPathParametersLabelExpansionExplodes());
    }

    /**
     * Builds an instance of PathParametersMatrixExpansionStandardAsyncClient class.
     * 
     * @return an instance of PathParametersMatrixExpansionStandardAsyncClient.
     */
    @Generated
    public PathParametersMatrixExpansionStandardAsyncClient buildPathParametersMatrixExpansionStandardAsyncClient() {
        return new PathParametersMatrixExpansionStandardAsyncClient(
            buildInnerClient().getPathParametersMatrixExpansionStandards());
    }

    /**
     * Builds an instance of PathParametersMatrixExpansionExplodeAsyncClient class.
     * 
     * @return an instance of PathParametersMatrixExpansionExplodeAsyncClient.
     */
    @Generated
    public PathParametersMatrixExpansionExplodeAsyncClient buildPathParametersMatrixExpansionExplodeAsyncClient() {
        return new PathParametersMatrixExpansionExplodeAsyncClient(
            buildInnerClient().getPathParametersMatrixExpansionExplodes());
    }

    /**
     * Builds an instance of QueryParametersAsyncClient class.
     * 
     * @return an instance of QueryParametersAsyncClient.
     */
    @Generated
    public QueryParametersAsyncClient buildQueryParametersAsyncClient() {
        return new QueryParametersAsyncClient(buildInnerClient().getQueryParameters());
    }

    /**
     * Builds an instance of QueryParametersQueryExpansionStandardAsyncClient class.
     * 
     * @return an instance of QueryParametersQueryExpansionStandardAsyncClient.
     */
    @Generated
    public QueryParametersQueryExpansionStandardAsyncClient buildQueryParametersQueryExpansionStandardAsyncClient() {
        return new QueryParametersQueryExpansionStandardAsyncClient(
            buildInnerClient().getQueryParametersQueryExpansionStandards());
    }

    /**
     * Builds an instance of QueryParametersQueryExpansionExplodeAsyncClient class.
     * 
     * @return an instance of QueryParametersQueryExpansionExplodeAsyncClient.
     */
    @Generated
    public QueryParametersQueryExpansionExplodeAsyncClient buildQueryParametersQueryExpansionExplodeAsyncClient() {
        return new QueryParametersQueryExpansionExplodeAsyncClient(
            buildInnerClient().getQueryParametersQueryExpansionExplodes());
    }

    /**
     * Builds an instance of QueryParametersQueryContinuationStandardAsyncClient class.
     * 
     * @return an instance of QueryParametersQueryContinuationStandardAsyncClient.
     */
    @Generated
    public QueryParametersQueryContinuationStandardAsyncClient
        buildQueryParametersQueryContinuationStandardAsyncClient() {
        return new QueryParametersQueryContinuationStandardAsyncClient(
            buildInnerClient().getQueryParametersQueryContinuationStandards());
    }

    /**
     * Builds an instance of QueryParametersQueryContinuationExplodeAsyncClient class.
     * 
     * @return an instance of QueryParametersQueryContinuationExplodeAsyncClient.
     */
    @Generated
    public QueryParametersQueryContinuationExplodeAsyncClient
        buildQueryParametersQueryContinuationExplodeAsyncClient() {
        return new QueryParametersQueryContinuationExplodeAsyncClient(
            buildInnerClient().getQueryParametersQueryContinuationExplodes());
    }

    /**
     * Builds an instance of InInterfaceAsyncClient class.
     * 
     * @return an instance of InInterfaceAsyncClient.
     */
    @Generated
    public InInterfaceAsyncClient buildInInterfaceAsyncClient() {
        return new InInterfaceAsyncClient(buildInnerClient().getInInterfaces());
    }

    /**
     * Builds an instance of RoutesClient class.
     * 
     * @return an instance of RoutesClient.
     */
    @Generated
    public RoutesClient buildClient() {
        return new RoutesClient(buildInnerClient());
    }

    /**
     * Builds an instance of PathParametersClient class.
     * 
     * @return an instance of PathParametersClient.
     */
    @Generated
    public PathParametersClient buildPathParametersClient() {
        return new PathParametersClient(buildInnerClient().getPathParameters());
    }

    /**
     * Builds an instance of PathParametersReservedExpansionClient class.
     * 
     * @return an instance of PathParametersReservedExpansionClient.
     */
    @Generated
    public PathParametersReservedExpansionClient buildPathParametersReservedExpansionClient() {
        return new PathParametersReservedExpansionClient(buildInnerClient().getPathParametersReservedExpansions());
    }

    /**
     * Builds an instance of PathParametersSimpleExpansionStandardClient class.
     * 
     * @return an instance of PathParametersSimpleExpansionStandardClient.
     */
    @Generated
    public PathParametersSimpleExpansionStandardClient buildPathParametersSimpleExpansionStandardClient() {
        return new PathParametersSimpleExpansionStandardClient(
            buildInnerClient().getPathParametersSimpleExpansionStandards());
    }

    /**
     * Builds an instance of PathParametersSimpleExpansionExplodeClient class.
     * 
     * @return an instance of PathParametersSimpleExpansionExplodeClient.
     */
    @Generated
    public PathParametersSimpleExpansionExplodeClient buildPathParametersSimpleExpansionExplodeClient() {
        return new PathParametersSimpleExpansionExplodeClient(
            buildInnerClient().getPathParametersSimpleExpansionExplodes());
    }

    /**
     * Builds an instance of PathParametersPathExpansionStandardClient class.
     * 
     * @return an instance of PathParametersPathExpansionStandardClient.
     */
    @Generated
    public PathParametersPathExpansionStandardClient buildPathParametersPathExpansionStandardClient() {
        return new PathParametersPathExpansionStandardClient(
            buildInnerClient().getPathParametersPathExpansionStandards());
    }

    /**
     * Builds an instance of PathParametersPathExpansionExplodeClient class.
     * 
     * @return an instance of PathParametersPathExpansionExplodeClient.
     */
    @Generated
    public PathParametersPathExpansionExplodeClient buildPathParametersPathExpansionExplodeClient() {
        return new PathParametersPathExpansionExplodeClient(
            buildInnerClient().getPathParametersPathExpansionExplodes());
    }

    /**
     * Builds an instance of PathParametersLabelExpansionStandardClient class.
     * 
     * @return an instance of PathParametersLabelExpansionStandardClient.
     */
    @Generated
    public PathParametersLabelExpansionStandardClient buildPathParametersLabelExpansionStandardClient() {
        return new PathParametersLabelExpansionStandardClient(
            buildInnerClient().getPathParametersLabelExpansionStandards());
    }

    /**
     * Builds an instance of PathParametersLabelExpansionExplodeClient class.
     * 
     * @return an instance of PathParametersLabelExpansionExplodeClient.
     */
    @Generated
    public PathParametersLabelExpansionExplodeClient buildPathParametersLabelExpansionExplodeClient() {
        return new PathParametersLabelExpansionExplodeClient(
            buildInnerClient().getPathParametersLabelExpansionExplodes());
    }

    /**
     * Builds an instance of PathParametersMatrixExpansionStandardClient class.
     * 
     * @return an instance of PathParametersMatrixExpansionStandardClient.
     */
    @Generated
    public PathParametersMatrixExpansionStandardClient buildPathParametersMatrixExpansionStandardClient() {
        return new PathParametersMatrixExpansionStandardClient(
            buildInnerClient().getPathParametersMatrixExpansionStandards());
    }

    /**
     * Builds an instance of PathParametersMatrixExpansionExplodeClient class.
     * 
     * @return an instance of PathParametersMatrixExpansionExplodeClient.
     */
    @Generated
    public PathParametersMatrixExpansionExplodeClient buildPathParametersMatrixExpansionExplodeClient() {
        return new PathParametersMatrixExpansionExplodeClient(
            buildInnerClient().getPathParametersMatrixExpansionExplodes());
    }

    /**
     * Builds an instance of QueryParametersClient class.
     * 
     * @return an instance of QueryParametersClient.
     */
    @Generated
    public QueryParametersClient buildQueryParametersClient() {
        return new QueryParametersClient(buildInnerClient().getQueryParameters());
    }

    /**
     * Builds an instance of QueryParametersQueryExpansionStandardClient class.
     * 
     * @return an instance of QueryParametersQueryExpansionStandardClient.
     */
    @Generated
    public QueryParametersQueryExpansionStandardClient buildQueryParametersQueryExpansionStandardClient() {
        return new QueryParametersQueryExpansionStandardClient(
            buildInnerClient().getQueryParametersQueryExpansionStandards());
    }

    /**
     * Builds an instance of QueryParametersQueryExpansionExplodeClient class.
     * 
     * @return an instance of QueryParametersQueryExpansionExplodeClient.
     */
    @Generated
    public QueryParametersQueryExpansionExplodeClient buildQueryParametersQueryExpansionExplodeClient() {
        return new QueryParametersQueryExpansionExplodeClient(
            buildInnerClient().getQueryParametersQueryExpansionExplodes());
    }

    /**
     * Builds an instance of QueryParametersQueryContinuationStandardClient class.
     * 
     * @return an instance of QueryParametersQueryContinuationStandardClient.
     */
    @Generated
    public QueryParametersQueryContinuationStandardClient buildQueryParametersQueryContinuationStandardClient() {
        return new QueryParametersQueryContinuationStandardClient(
            buildInnerClient().getQueryParametersQueryContinuationStandards());
    }

    /**
     * Builds an instance of QueryParametersQueryContinuationExplodeClient class.
     * 
     * @return an instance of QueryParametersQueryContinuationExplodeClient.
     */
    @Generated
    public QueryParametersQueryContinuationExplodeClient buildQueryParametersQueryContinuationExplodeClient() {
        return new QueryParametersQueryContinuationExplodeClient(
            buildInnerClient().getQueryParametersQueryContinuationExplodes());
    }

    /**
     * Builds an instance of InInterfaceClient class.
     * 
     * @return an instance of InInterfaceClient.
     */
    @Generated
    public InInterfaceClient buildInInterfaceClient() {
        return new InInterfaceClient(buildInnerClient().getInInterfaces());
    }

    private static final ClientLogger LOGGER = new ClientLogger(RoutesClientBuilder.class);
}
