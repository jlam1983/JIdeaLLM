# Progress

## FLOW_PROGRESS Nodes

> Ordered execution steps - each step is a node in the flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLOW_PROGRESS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐  │
│  │  1    │─►│  2    │─►│  3    │─►│  4    │─►│  5    │─►│ ... │  │
│  │TEMPLATE│ │INPUT  │ │DISSOLVE│ │ LIST  │ │ANALYZE│ │      │  │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘  │
│                                                                  │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐  │
│  │  6    │─►│  7    │─►│  8    │─►│  9    │─►│  10   │─►│ 11   │  │
│  │JUDGE  │ │PROGRESS│ │INTEGRATE││OUTPUT │ │FEEDBACK│ │VALUE │  │
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Steps

| # | Node | Description |
|---|------|-------------|
| 1 | FLOW TEMPLATE | Load/configure template |
| 2 | FLOW VALUE INPUT | Accept input values |
| 3 | FLOW VALUE DISSOLVE | Break down values |
| 4 | FLOW VALUE LIST | List parsed values |
| 5 | Multi-View Analysis | Analyze from multiple views |
| 6 | Judge & Evaluate | Judge and evaluate |
| 7 | FLOW PROGRESS | Track progress |
| 8 | FLOW VALUE INTEGRATE | Integrate values |
| 9 | Output + Format Control | Control output format |
| 10 | Feedback & Update | Process feedback |
| 11 | FLOW VALUE OUTPUT | Final output |

## Node Properties

Double-click any step node to edit:
- Timeout settings
- Retry count
- Output mapping
- Error handling
