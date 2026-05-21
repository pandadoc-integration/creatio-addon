// Example of using the PandaDoc custom component in a Creatio page
// This replaces the original handler approach from prompt.md

define("ExpPage_PandaDocExample", /**SCHEMA_DEPS*/ [] /**SCHEMA_DEPS*/, function () /**SCHEMA_ARGS*/ /**SCHEMA_ARGS*/ {
  return {
    viewConfigDiff: /**SCHEMA_VIEW_CONFIG_DIFF*/ [
      {
        operation: "remove",
        name: "MainContainer",
      },
      {
        operation: "insert",
        name: "PandaDocContainer",
        values: {
          type: "crt.FlexContainer",
          direction: "column",
          items: [],
        },
        parentName: "Main",
        propertyName: "items",
        index: 1,
      },
      {
        operation: "insert",
        name: "PandaDocViewer",
        values: {
          type: "pdc.PandaDoc",
          width: "100%",
          height: "600px",
          entityType: "deal",
          entityId: "$Id",
          providerName: "creatio",
          externalEditor: true,
          isExternalRunner: true,
        },
        parentName: "PandaDocContainer",
        propertyName: "items",
        index: 0,
      },
    ] /**SCHEMA_VIEW_CONFIG_DIFF*/,
    viewModelConfigDiff: /**SCHEMA_VIEW_MODEL_CONFIG_DIFF*/ [
      {
        operation: "merge",
        path: ["attributes"],
        values: {
          PandaDocViewer: {
            modelConfig: {
              path: "PandaDocViewerAttribute",
            },
          },
        },
      },
    ] /**SCHEMA_VIEW_MODEL_CONFIG_DIFF*/,
    modelConfigDiff:
      /**SCHEMA_MODEL_CONFIG_DIFF*/ [] /**SCHEMA_MODEL_CONFIG_DIFF*/,
    handlers: /**SCHEMA_HANDLERS*/ [
      {
        request: "crt.HandleViewModelInitRequest",
        handler: async (request, next) => {
          // Optional: Add any additional initialization logic here
          // The PandaDoc component will handle SDK loading and initialization automatically

          console.log("Page initialized with PandaDoc custom component");

          return await next?.handle(request);
        },
      },
      {
        request: "pdc.PandaDocDocumentCreateRequest",
        handler: async (request, next) => {
          // Handle document creation events from the component
          console.log(
            "Document creation event received from PandaDoc component"
          );

          // Add your custom logic here

          return await next?.handle(request);
        },
      },
      {
        request: "pdc.PandaDocDocumentOpenRequest",
        handler: async (request, next) => {
          // Handle document open events from the component
          console.log(
            "Document open event received from PandaDoc component:",
            request
          );

          // Add your custom logic here

          return await next?.handle(request);
        },
      },
    ] /**SCHEMA_HANDLERS*/,
    converters: /**SCHEMA_CONVERTERS*/ {} /**SCHEMA_CONVERTERS*/,
    validators: /**SCHEMA_VALIDATORS*/ {} /**SCHEMA_VALIDATORS*/,
  };
});
