import { code, refkey } from "@alloy-js/core";
import * as jv from "@alloy-js/java";
import { HttpAuth, HttpServiceAuthentication } from "@typespec/http";
import { springFramework } from "../spring/libraries/index.js";

/**
 * Emits auth configuration for the service based on provided auth.
 *
 * Note: Currently this only supports a single auth scheme configured on the entire service,
 * multiple auth schemes and per operation overrides will still have to be done
 *
 * @param auth
 */
export function emitAuth(auth: HttpServiceAuthentication) {
  // Get default auth scheme to use
  const defaultAuthScheme = auth?.defaultAuth?.options?.[0]?.all?.[0]?.auth as HttpAuth;

  // No auth, don't emit anything
  if (!defaultAuthScheme) {
    return null;
  }

  return (
    <jv.PackageDirectory package="auth">
      <jv.SourceFile path="ServiceAuth.java">
        <jv.Interface public name="ServiceAuth">
          <jv.Method public name="getIssuerUrl" return="String" />
        </jv.Interface>
      </jv.SourceFile>
      <jv.SourceFile path="AuthConfig.java">
        <jv.Annotation type={springFramework.Configuration} />
        <jv.Annotation type={springFramework.EnableWebSecurity} />
        <jv.Class public name="AuthConfig">
          <jv.Variable private final type={refkey("ServiceAuth")} name="auth" />

          <jv.Annotation type={springFramework.Autowired} />
          <jv.Constructor public name="AuthConfig" parameters={{ auth: refkey("ServiceAuth") }}>
            this.auth = auth;
          </jv.Constructor>

          <jv.Annotation type={springFramework.Bean} />
          <jv.Method
            public
            name="securityFilterChain"
            return={springFramework.SecurityFilterChain}
            parameters={{ http: springFramework.HttpSecurity }}
            throws="Exception"
          >
            {code`
              http
              .authorizeHttpRequests((authorize) -> authorize
                .anyRequest().authenticated()
              )
              .oauth2ResourceServer((oauth2) -> oauth2
                .jwt(${springFramework.Customizer}.withDefaults())
              );
              return http.build();
            `}
          </jv.Method>

          <jv.Annotation type={springFramework.Bean} />
          <jv.Method public name="jwtDecoder" return={springFramework.JwtDecoder}>
            return {springFramework.JwtDecoders}.fromIssuerLocation(auth.getIssuerUrl());
          </jv.Method>
        </jv.Class>
      </jv.SourceFile>
    </jv.PackageDirectory>
  );
}
