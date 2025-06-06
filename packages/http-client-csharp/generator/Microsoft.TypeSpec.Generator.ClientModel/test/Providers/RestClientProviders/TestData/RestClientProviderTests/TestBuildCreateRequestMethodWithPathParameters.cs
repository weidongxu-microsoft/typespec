// <auto-generated/>

#nullable disable

using System.ClientModel.Primitives;
using System.Collections.Generic;

namespace Sample
{
    public partial class TestClient
    {
        internal global::System.ClientModel.Primitives.PipelineMessage CreateSampleOpRequest(string p1, global::System.Collections.Generic.IEnumerable<int> p2, global::System.Collections.Generic.IDictionary<string, int> p3, global::System.ClientModel.Primitives.RequestOptions options)
        {
            global::System.ClientModel.Primitives.PipelineMessage message = Pipeline.CreateMessage();
            message.ResponseClassifier = PipelineMessageClassifier200;
            global::System.ClientModel.Primitives.PipelineRequest request = message.Request;
            request.Method = "GET";
            global::Sample.ClientUriBuilder uri = new global::Sample.ClientUriBuilder();
            uri.Reset(_endpoint);
            uri.AppendPath("/", false);
            uri.AppendPath(p1, true);
            uri.AppendPath("/", false);
            uri.AppendPathDelimited(p2, " ", null, true);
            uri.AppendPath("/", false);
            uri.AppendPathDelimited(p3, null, null, true);
            request.Uri = uri.ToUri();
            message.Apply(options);
            return message;
        }
    }
}
