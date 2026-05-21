# PandaDoc Custom Component

A reusable Angular component for integrating PandaDoc functionality into Creatio applications.

## Features

- **Reusable**: Can be used across multiple pages and applications
- **Configurable**: Flexible properties for different use cases
- **Type Safe**: Full TypeScript support with proper typing
- **Event-Driven**: Clean event handling through Angular outputs
- **Error Handling**: Graceful error states and user feedback
- **Auto-Loading**: Automatic PandaDoc SDK loading and initialization

## Component Properties

| Property           | Type    | Default   | Description                              |
| ------------------ | ------- | --------- | ---------------------------------------- |
| `width`            | string  | '100%'    | Width of the PandaDoc container          |
| `height`           | string  | '100%'    | Height of the PandaDoc container         |
| `entityType`       | string  | 'Contact' | Type of entity (e.g., 'deal', 'contact') |
| `entityId`         | string  | ''        | ID of the source entity                  |
| `providerName`     | string  | 'creatio' | Integration provider name                |
| `externalEditor`   | boolean | true      | Enable external document editor handling |
| `isExternalRunner` | boolean | true      | Enable external workflow handling        |

## Component Events

| Event            | Description                               | Payload               |
| ---------------- | ----------------------------------------- | --------------------- |
| `documentLoaded` | Fired when SDK is loaded                  | `{ sdkLoaded: true }` |
| `documentCreate` | Fired when document creation is initiated | void                  |
| `documentOpen`   | Fired when document is opened             | Document object       |
| `workflowStart`  | Fired when workflow is started            | void                  |
| `workflowOpen`   | Fired when workflow is opened             | Workflow object       |

## Usage in Creatio Pages

### Method 1: Page Schema Configuration (Recommended)

Add the PandaDoc component to your page schema:

```javascript
{
    "operation": "insert",
    "name": "PandaDocViewer",
    "values": {
        "type": "pdc.PandaDoc",
        "width": "100%",
        "height": "100%",
        "entityType": "deal",
        "entityId": "$Id$",
        "providerName": "creatio",
        "externalEditor": true,
        "isExternalRunner": true
    },
    "parentName": "YourContainer",
    "propertyName": "items",
    "index": 0
}
```

### Method 2: Dynamic Configuration

You can bind component properties to page attributes for dynamic behavior:

```javascript
viewModelConfigDiff: [
  {
    operation: "merge",
    path: ["attributes"],
    values: {
      PandaDocEntityId: {
        modelConfig: {
          path: "PdcPandaDocEntityId",
        },
      },
    },
  },
];
```

Then bind the component property:

```javascript
{
    "operation": "insert",
    "name": "PandaDocViewer",
    "values": {
        "type": "pdc.PandaDoc",
        "entityId": "$PandaDocEntityId"
    }
}
```

## Component Benefits

1. **Configuration**: Flexible properties that can be customized per use case
2. **Event Handling**: Clean event emitters for integration with Creatio workflows
3. **Error Handling**: Comprehensive error states and recovery mechanisms
4. **Reusability**: Component can be used across multiple pages
5. **Type Safety**: TypeScript provides better development experience

## Implementation Guide

To implement the PandaDoc component in your Creatio application:

1. Ensure the component is properly registered in `app.module.ts`
2. Add the component to your page schema with desired configuration
3. Configure component properties to match your integration needs
4. Handle events through component outputs for custom workflows

## Troubleshooting

- **Component not loading**: Check that the component is properly registered in `app.module.ts`
- **SDK not loading**: Check browser console for network errors
- **Events not firing**: Verify `externalEditor` and `isExternalRunner` are set to `true`
- **Authentication issues**: Check PandaDoc configuration and API keys
