import "@typespec/http";
import "@typespec/rest";
import "@typespec/versioning";
import "@azure-tools/typespec-azure-core";
import "@azure-tools/typespec-client-generator-core";

using Http;
using Rest;
using Versioning;
using Azure.Core;
using Azure.Core.Traits;
using Azure.ClientGenerator.Core;

@useAuth(
  ApiKeyAuth<ApiKeyLocation.header, "api-key"> | OAuth2Auth<[
    {
      type: OAuth2FlowType.implicit,
      authorizationUrl: "https://login.contoso.com/common/oauth2/v2.0/authorize",
      scopes: ["https://widget.contoso.com/.default"],
    }
  ]>
)
@service(#{ title: "Contoso Widget Manager" })
@server(
  "{endpoint}/widget",
  "Contoso Widget APIs",
  {
    /** 
Supported Widget Services endpoints (protocol and hostname, for example:
https://westus.api.widget.contoso.com).
 */
    endpoint: string,
  }
)
@versioned(Contoso.WidgetManager.Versions)
namespace Contoso.WidgetManager;

/** The Contoso Widget Manager service version. */
enum Versions {
  /** Version 2022-08-31 */
  `2022-08-30`,
}

// Models ////////////////////

/** A widget. */
@access(Access.public)
@usage(Usage.input | Usage.output)
@resource("widgets")
model Widget {
  /** The widget name. */
  @key("widgetName")
  @visibility(Lifecycle.Read)
  name: string;

  /** The ID of the widget's manufacturer. */
  manufacturerId: string;

  ...EtagProperty;
}

/** A submitted repair request for a widget. */
@access(Access.public)
@usage(Usage.input | Usage.output)
model WidgetRepairRequest {
  /** The date and time when the repair is scheduled to occur. */
  scheduledDateTime: utcDateTime;

  /** The date and time when the request was created. */
  createdDateTime: utcDateTime;

  /** The date and time when the request was updated. */
  updatedDateTime: utcDateTime;

  /** The date and time when the request was completed. */
  completedDateTime: utcDateTime;
}

/** A widget's part. */
@access(Access.public)
@usage(Usage.input | Usage.output)
@resource("parts")
@parentResource(Widget)
model WidgetPart {
  /** The name of the part. */
  @key("widgetPartName")
  @visibility(Lifecycle.Read)
  name: string;

  /** The ID to use for reordering the part. */
  partId: string;

  /** The ID of the part's manufacturer. */
  manufacturerId: string;

  ...EtagProperty;
}

/** The details of a reorder request for a WidgetPart. */
@access(Access.public)
@usage(Usage.input | Usage.output)
model WidgetPartReorderRequest {
  /** Identifies who signed off the reorder request. */
  signedOffBy: string;
}

// An example of a singleton resource
/** Provides analytics about the use and maintenance of a Widget. */
@access(Access.public)
@usage(Usage.input | Usage.output)
@resource("analytics")
@parentResource(Widget)
model WidgetAnalytics {
  /** The identifier for the analytics object.  There is only one named 'current'. */
  @key("analyticsId")
  @visibility(Lifecycle.Read)
  id: "current";

  /** The number of uses of the widget. */
  useCount: int64;

  /** The number of times the widget was repaired. */
  repairCount: int64;
}

/** A manufacturer of widgets. */
@access(Access.public)
@usage(Usage.input | Usage.output)
@resource("manufacturers")
model Manufacturer {
  /** The manufacturer's unique ID. */
  @key("manufacturerId")
  @visibility(Lifecycle.Read)
  id: string;

  /** The manufacturer's name. */
  name: string;

  /** The manufacturer's full address. */
  address: string;

  ...EtagProperty;
}
