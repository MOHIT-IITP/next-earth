import { Project, Task, Note, Diagram, ActivityItem, KanbanColumn } from "./types";

export const DEFAULT_KANBAN_COLUMNS: Omit<KanbanColumn, "projectId">[] = [
  { id: "col-backlog", title: "Backlog", order: 0 },
  { id: "col-todo", title: "Todo", order: 1 },
  { id: "col-in_progress", title: "In Progress", order: 2 },
  { id: "col-in_review", title: "In Review", order: 3 },
  { id: "col-done", title: "Done", order: 4 },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-01",
    name: "Serengeti Savanna Corridor",
    slug: "serengeti-savanna-corridor",
    description: "Multi-trophic canopy analysis, ungulate migration mapping, and perennial grass density tracking across the Mara divide.",
    icon: "compass",
    status: "active",
    targetDate: "2026-12-15",
    accent: "terracotta",
    biome: "Tropical Grassland",
    createdAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-10-24T14:30:00Z",
  },
  {
    id: "proj-02",
    name: "Alpine High Meadows Survey",
    slug: "alpine-high-meadows-survey",
    description: "Permafrost melt impact on sub-alpine floral phenology, mycorrhizal resilience, and snowpack recession gradients.",
    icon: "mountain",
    status: "active",
    targetDate: "2026-11-30",
    accent: "olive",
    biome: "Montane Meadow",
    createdAt: "2026-02-14T09:30:00Z",
    updatedAt: "2026-10-23T11:15:00Z",
  },
  {
    id: "proj-03",
    name: "Mediterranean Maritime Forest",
    slug: "mediterranean-maritime-forest",
    description: "Drought-adapted Quercus ilex seedling regeneration, coastal soil hydration mapping, and fungal symbiosis indicators.",
    icon: "trees",
    status: "active",
    targetDate: "2027-04-10",
    accent: "sand",
    biome: "Coastal Sclerophyll",
    createdAt: "2026-03-20T10:00:00Z",
    updatedAt: "2026-10-21T16:45:00Z",
  },
  {
    id: "proj-04",
    name: "Patagonia Glacial Peatland",
    slug: "patagonia-glacial-peatland",
    description: "Sphagnum carbon flux metrics, methane degassing rhythms, and hydrological retention under southern subpolar microclimate shifts.",
    icon: "cloud-rain",
    status: "active",
    targetDate: "2026-10-15",
    accent: "charcoal",
    biome: "Subpolar Mire",
    createdAt: "2026-04-05T12:00:00Z",
    updatedAt: "2026-10-19T08:20:00Z",
  },
  {
    id: "proj-05",
    name: "Sonoran Desert Ephemeral Flora",
    slug: "sonoran-desert-ephemeral-flora",
    description: "Flash flood seed bank dormancy release, succulent hydraulic architecture, and pollinator synchrony during El Niño pulses.",
    icon: "sun",
    status: "completed",
    targetDate: "2026-09-01",
    accent: "sand",
    biome: "Arid Steppe",
    createdAt: "2025-11-01T08:00:00Z",
    updatedAt: "2026-09-05T17:00:00Z",
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: "task-01",
    projectId: "proj-01",
    columnId: "col-in_progress",
    order: 0,
    title: "Calibrate telemetry collars on western Mara herd",
    description: "Inspect UHF radio beacon batteries and GPS ping interval before migration crossing.",
    type: "research",
    status: "in_progress",
    priority: "high",
    labels: ["Telemetry", "Wildlife", "Field"],
    dueDate: "2026-11-05",
    checklists: [
      { id: "c1", title: "Test UHF beacon frequency (151.2 MHz)", completed: true },
      { id: "c2", title: "Check collar battery voltage threshold", completed: true },
      { id: "c3", title: "Verify satellite ping handshake with base station", completed: false },
    ],
    linkedNoteIds: ["note-01"],
    linkedDiagramIds: ["diag-01"],
    createdAt: "2026-10-15T08:00:00Z",
    updatedAt: "2026-10-24T12:00:00Z",
    assigneeName: "Dr. Elena Rostova",
  },
  {
    id: "task-02",
    projectId: "proj-01",
    columnId: "col-todo",
    order: 0,
    title: "Collect deep core soil samples along transect Gamma",
    description: "Extract 50cm soil horizons for nitrogen and organic carbon fractionation.",
    type: "research",
    status: "todo",
    priority: "medium",
    labels: ["Soil", "Sediment"],
    dueDate: "2026-11-12",
    checklists: [
      { id: "c4", title: "Clean vacuum coring tubes", completed: false },
      { id: "c5", title: "Coordinate transport refrigeration unit", completed: false },
    ],
    createdAt: "2026-10-18T09:00:00Z",
    updatedAt: "2026-10-23T09:40:00Z",
    assigneeName: "Julian Thorne",
  },
  {
    id: "task-03",
    projectId: "proj-01",
    columnId: "col-done",
    order: 0,
    title: "Publish Q3 ungulate grazing spatial density report",
    description: "Compiled GIS shapefiles and seasonal forage biomass index.",
    type: "feature",
    status: "completed",
    priority: "low",
    labels: ["Report", "Cartography"],
    completedAt: "2026-10-18T16:00:00Z",
    linkedDiagramIds: ["diag-01"],
    createdAt: "2026-09-25T10:00:00Z",
    updatedAt: "2026-10-18T16:00:00Z",
    assigneeName: "Dr. Elena Rostova",
  },
  {
    id: "task-04",
    projectId: "proj-01",
    columnId: "col-backlog",
    order: 0,
    title: "Evaluate solar power budget for remote river acoustic sensors",
    description: "Assess rainy season shading on 50W photovoltaic modules.",
    type: "chore",
    status: "todo",
    priority: "low",
    labels: ["Sensors", "Hardware"],
    dueDate: "2026-12-01",
    createdAt: "2026-10-20T11:00:00Z",
    updatedAt: "2026-10-21T09:30:00Z",
    assigneeName: "Mateo Silva",
  },
  {
    id: "task-05",
    projectId: "proj-01",
    columnId: "col-in_review",
    order: 0,
    title: "Verify drone photogrammetry ortho-mosaic alignment",
    description: "Ensure geometric error is under 3cm against surveyed ground control benchmarks.",
    type: "enhancement",
    status: "in_progress",
    priority: "high",
    labels: ["Drone", "LiDAR", "GIS"],
    dueDate: "2026-10-30",
    checklists: [
      { id: "c6", title: "Import GCP coordinate list", completed: true },
      { id: "c7", title: "Calculate RMS reprojection error", completed: true },
      { id: "c8", title: "Peer review with geospatial lead", completed: false },
    ],
    createdAt: "2026-10-19T14:00:00Z",
    updatedAt: "2026-10-24T10:15:00Z",
    assigneeName: "Dr. Elena Rostova",
  },
  {
    id: "task-06",
    projectId: "proj-02",
    columnId: "col-in_progress",
    order: 0,
    title: "Deploy temperature logger array at 2,800m saddle",
    description: "Install 12 iButton thermal sensors to monitor subnivean freeze-thaw cycles.",
    type: "research",
    status: "in_progress",
    priority: "urgent",
    labels: ["Thermal", "Snowpack"],
    dueDate: "2026-10-29",
    createdAt: "2026-10-14T08:00:00Z",
    updatedAt: "2026-10-23T14:10:00Z",
    assigneeName: "Dr. Elena Rostova",
  },
  {
    id: "task-07",
    projectId: "proj-02",
    columnId: "col-todo",
    order: 0,
    title: "Sequence Ranunculus glacialis leaf tissue isolates",
    description: "High-throughput chloroplast DNA barcode sequencing for cold-hardiness markers.",
    type: "research",
    status: "todo",
    priority: "medium",
    labels: ["Genetics", "Floral"],
    dueDate: "2026-11-20",
    createdAt: "2026-10-16T10:00:00Z",
    updatedAt: "2026-10-20T11:00:00Z",
    assigneeName: "Kaelen Voss",
  },
  {
    id: "task-08",
    projectId: "proj-04",
    columnId: "col-todo",
    order: 0,
    title: "Retrieve eddy covariance tower datalogger cards",
    description: "Routine flash storage swap for southern peatland methane flux analyzer.",
    type: "bug",
    status: "todo",
    priority: "urgent",
    labels: ["Telemetry", "Peatland"],
    dueDate: "2026-10-18",
    createdAt: "2026-10-12T09:00:00Z",
    updatedAt: "2026-10-19T08:20:00Z",
    assigneeName: "Mateo Silva",
  },
  {
    id: "task-09",
    projectId: "proj-03",
    columnId: "col-done",
    order: 0,
    title: "Measure stomatal conductance in drought-stressed saplings",
    description: "Li-6800 gas exchange measurements across 30 tagged Quercus specimens.",
    type: "research",
    status: "completed",
    priority: "medium",
    labels: ["Hydrology", "Physiology"],
    completedAt: "2026-10-21T15:30:00Z",
    createdAt: "2026-10-08T11:00:00Z",
    updatedAt: "2026-10-21T15:30:00Z",
    assigneeName: "Amina Al-Sayed",
  },
  {
    id: "task-10",
    projectId: "proj-03",
    columnId: "col-todo",
    order: 0,
    title: "Install sap-flow sensors in mature cork oak specimens",
    description: "Granier thermal dissipation probes calibrated for daily transpiration curve.",
    type: "chore",
    status: "todo",
    priority: "high",
    labels: ["Sensors", "Oak"],
    dueDate: "2026-11-15",
    createdAt: "2026-10-17T13:00:00Z",
    updatedAt: "2026-10-22T10:15:00Z",
    assigneeName: "Amina Al-Sayed",
  },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: "note-01",
    projectId: "proj-01",
    title: "Acacia tortilis Canopy Recovery & Soil Hydration",
    content: `# Acacia tortilis Canopy Recovery & Soil Hydration

Field survey conducted across **Mara Transect Gamma** following selective savanna burning.

## Key Observations
* **Epicormic sprouting:** Detected in *94%* of mature specimens within 14 days of fire pulse.
* **Litter layer moisture:** Maintained at **18.4% volumetric water content** beneath unburned canopy fragments.
* **Ungulate grazing pressure:** Substantial concentration of Thomson's gazelles along the outer perimeter.

### Soil Chemistry Stratification
| Depth (cm) | Organic C (%) | Total N (%) | pH |
| :--- | :--- | :--- | :--- |
| 0 - 10 | 3.42 | 0.28 | 6.8 |
| 10 - 30 | 2.15 | 0.17 | 7.1 |
| 30 - 50 | 1.08 | 0.09 | 7.4 |

> "The rapid regeneration of Acacia epicormic buds serves as a primary carbon sink during early post-burn succession." — *Dr. Elena Rostova*

### Next Field Protocols
- [x] Deploy Campbell Scientific CS655 moisture probes
- [x] Calibrate UHF telemetry stations
- [ ] Sample deep rhizospheric microbial biomass

\`\`\`python
# Soil flux integration formula
def integrate_soil_flux(v_water, c_depth):
    return (v_water * 0.42) + (c_depth * 0.15)
\`\`\`
`,
    tags: ["Canopy", "Fire Ecology", "Serengeti"],
    linkedTaskIds: ["task-01", "task-02"],
    linkedDiagramIds: ["diag-01"],
    createdAt: "2026-10-14T09:00:00Z",
    updatedAt: "2026-10-24T13:45:00Z",
  },
  {
    id: "note-02",
    projectId: "proj-02",
    title: "Late-season Gentiana verna Flowering Observations",
    content: `# Late-Season Gentiana verna Flowering Pulse

Observations recorded along the **2,450m alpine saddle** of the Gran Paradiso transect.

## Environmental Pre-conditions
1. Inversion layer stabilized ambient temperatures at **+4.2°C above seasonal mean**.
2. Early snowpack melted prematurely, exposing subterranean floral buds.
3. Mycorrhizal fungal filaments (*Glomus intraradices*) exhibited active hyphal branching.

> Caution: Second flowering events deplete root starch reserves prior to deep subnivean freeze.

- [x] Document GPS coordinates of tagged cushions
- [ ] Measure floral nectar sucrose concentration
- [ ] Photograph corolla reflectance under UV spectrum
`,
    tags: ["Phenology", "Alpine", "Floral"],
    linkedTaskIds: ["task-06"],
    linkedDiagramIds: ["diag-02"],
    createdAt: "2026-10-18T11:20:00Z",
    updatedAt: "2026-10-23T16:20:00Z",
  },
  {
    id: "note-03",
    projectId: "proj-04",
    title: "Permafrost Ice Lens Sublimation & Methane Release",
    content: `# Permafrost Ice Lens Sublimation Metrics

Deep peat core telemetry across the **Patagonian Subpolar Mire**.

### Core Dynamics
* Probe 3 registered **subsurface warming trend of +0.08°C / week**.
* Eddy covariance methane baseline peaked at **242 nmol / m² / s**.
* Sphagnum magellanicum capitulum density dropped by 12% in micro-hummocks.

\`\`\`
CH4 + 2O2 -> CO2 + 2H2O (Methanotrophic aerobic oxidation)
\`\`\`

- [ ] Exchange datalogger SD cards
- [ ] Collect anaerobic porewater vials
`,
    tags: ["Carbon Flux", "Peatland", "Patagonia"],
    linkedTaskIds: ["task-08"],
    createdAt: "2026-10-11T08:30:00Z",
    updatedAt: "2026-10-20T09:15:00Z",
  },
  {
    id: "note-04",
    projectId: "proj-01",
    title: "Mara River Hydrological Baseline & Sediment Load",
    content: `# Mara River Hydrological Baseline

Station 2 monitoring data prior to major wildebeest crossing period.

* **Discharge Velocity:** 1.42 m/s
* **Turbidity:** 14 NTU
* **Dissolved Oxygen:** 7.8 mg/L

Hydrological continuity remains intact with no upstream diversions noted.
`,
    tags: ["Hydrology", "River", "Serengeti"],
    linkedTaskIds: ["task-01"],
    linkedDiagramIds: ["diag-01"],
    createdAt: "2026-10-15T14:00:00Z",
    updatedAt: "2026-10-22T11:00:00Z",
  },
];

export const SAMPLE_STARTER_CANVAS = {
  nodes: [
    {
      id: "node-client-1",
      type: "systemNode",
      position: { x: 80, y: 180 },
      data: {
        label: "Field Observer App",
        sublabel: "Next.js Mobile PWA",
        nodeType: "client",
        status: "active",
        accent: "terracotta",
        notes: "Deployed to 18 field rangers for offline GPS and collar ping capture.",
      },
    },
    {
      id: "node-lb-1",
      type: "systemNode",
      position: { x: 340, y: 180 },
      data: {
        label: "Network Load Balancer",
        sublabel: "TLS Termination & Health",
        nodeType: "load_balancer",
        status: "active",
        accent: "sand",
      },
    },
    {
      id: "node-gw-1",
      type: "systemNode",
      position: { x: 600, y: 180 },
      data: {
        label: "API Gateway",
        sublabel: "JWT Auth & Rate Limiter",
        nodeType: "api_gateway",
        status: "active",
        accent: "terracotta",
      },
    },
    {
      id: "node-queue-1",
      type: "systemNode",
      position: { x: 860, y: 80 },
      data: {
        label: "Telemetry Ingestion Queue",
        sublabel: "Kafka / Stream Buffer",
        nodeType: "message_queue",
        status: "active",
        accent: "olive",
      },
    },
    {
      id: "node-service-1",
      type: "systemNode",
      position: { x: 860, y: 260 },
      data: {
        label: "Geospatial Pipeline",
        sublabel: "Python PostGIS Processor",
        nodeType: "backend_service",
        status: "active",
        accent: "olive",
      },
    },
    {
      id: "node-cache-1",
      type: "systemNode",
      position: { x: 1140, y: 80 },
      data: {
        label: "Redis Spatial Cache",
        sublabel: "In-memory GeoJSON clusters",
        nodeType: "cache",
        status: "active",
        accent: "sand",
      },
    },
    {
      id: "node-db-1",
      type: "systemNode",
      position: { x: 1140, y: 260 },
      data: {
        label: "PostGIS Core Database",
        sublabel: "Spatial Sharded Clusters",
        nodeType: "database",
        status: "active",
        accent: "charcoal",
      },
    },
    {
      id: "node-ext-1",
      type: "systemNode",
      position: { x: 600, y: 380 },
      data: {
        label: "Copernicus Sentinel API",
        sublabel: "Satellite NDVI Spectral Data",
        nodeType: "external_service",
        status: "active",
        accent: "sand",
      },
    },
    {
      id: "node-cloud-1",
      type: "systemNode",
      position: { x: 1140, y: 440 },
      data: {
        label: "Satellite Tile Storage",
        sublabel: "S3 Object Store",
        nodeType: "cloud_service",
        status: "active",
        accent: "charcoal",
      },
    },
    {
      id: "node-note-1",
      type: "stickyNote",
      position: { x: 80, y: 380 },
      data: {
        label: "Savanna Sensor Sync",
        content: "Telemetry collars broadcast beacon bursts every 15 minutes across Mara River sector 3.",
        accent: "terracotta",
      },
    },
  ],
  edges: [
    { id: "e1-2", source: "node-client-1", target: "node-lb-1", animated: true },
    { id: "e2-3", source: "node-lb-1", target: "node-gw-1", animated: true },
    { id: "e3-4", source: "node-gw-1", target: "node-queue-1", animated: true },
    { id: "e3-5", source: "node-gw-1", target: "node-service-1", animated: true },
    { id: "e4-6", source: "node-queue-1", target: "node-cache-1", animated: true },
    { id: "e5-7", source: "node-service-1", target: "node-db-1", animated: false },
    { id: "e8-5", source: "node-ext-1", target: "node-service-1", animated: true },
    { id: "e5-9", source: "node-service-1", target: "node-cloud-1", animated: false },
  ],
  viewport: { x: 30, y: 40, zoom: 0.85 },
};

export const INITIAL_DIAGRAMS: Diagram[] = [
  {
    id: "diag-01",
    projectId: "proj-01",
    title: "Mara Basin Ungulate Telemetry Architecture",
    description: "Distributed edge sensor ingestion, Kafka stream buffering, and PostGIS trajectory pipeline.",
    type: "architecture",
    nodeCount: 10,
    edgeCount: 8,
    canvasData: SAMPLE_STARTER_CANVAS,
    linkedTaskIds: ["task-01", "task-03"],
    linkedNoteIds: ["note-01", "note-04"],
    createdAt: "2026-10-15T11:00:00Z",
    updatedAt: "2026-10-24T11:00:00Z",
  },
  {
    id: "diag-02",
    projectId: "proj-02",
    title: "Snowpack Sublimation & Alpine Floral Stratification",
    description: "Thermal sensor array mesh network and elevation gradient telemetry.",
    type: "soil_profile",
    nodeCount: 14,
    edgeCount: 10,
    linkedTaskIds: ["task-06"],
    linkedNoteIds: ["note-02"],
    createdAt: "2026-10-17T09:30:00Z",
    updatedAt: "2026-10-22T14:30:00Z",
  },
  {
    id: "diag-03",
    projectId: "proj-03",
    title: "Quercus ilex Hydraulic Lift & Deep Mycorrhizal Network",
    description: "Subsurface sap flow sensors and water table equilibrium model.",
    type: "canopy",
    nodeCount: 12,
    edgeCount: 8,
    linkedTaskIds: ["task-09"],
    createdAt: "2026-10-12T14:00:00Z",
    updatedAt: "2026-10-19T17:15:00Z",
  },
  {
    id: "diag-04",
    projectId: "proj-01",
    title: "Serengeti Fire Succession Process Flow",
    description: "Post-burn regenerative dynamics and biomass recovery timeline.",
    type: "flowchart",
    nodeCount: 9,
    edgeCount: 7,
    createdAt: "2026-10-18T10:00:00Z",
    updatedAt: "2026-10-23T15:00:00Z",
  },
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-01",
    projectId: "proj-01",
    projectName: "Serengeti Savanna Corridor",
    user: "Dr. Elena Rostova",
    action: "updated task",
    target: "Calibrate telemetry collars on western Mara herd",
    timestamp: "2 hours ago",
    iconType: "task",
  },
  {
    id: "act-02",
    projectId: "proj-01",
    projectName: "Serengeti Savanna Corridor",
    user: "Dr. Elena Rostova",
    action: "logged field note",
    target: "Acacia tortilis canopy recovery",
    timestamp: "4 hours ago",
    iconType: "note",
  },
  {
    id: "act-03",
    projectId: "proj-02",
    projectName: "Alpine High Meadows Survey",
    user: "Dr. Elena Rostova",
    action: "created diagram",
    target: "Snowpack Sublimation & Alpine Floral Stratification",
    timestamp: "Yesterday",
    iconType: "diagram",
  },
  {
    id: "act-04",
    projectId: "proj-03",
    projectName: "Mediterranean Maritime Forest",
    user: "Amina Al-Sayed",
    action: "completed task",
    target: "Measure stomatal conductance in drought-stressed saplings",
    timestamp: "3 days ago",
    iconType: "task",
  },
  {
    id: "act-05",
    projectId: "proj-01",
    projectName: "Serengeti Savanna Corridor",
    user: "Dr. Elena Rostova",
    action: "completed task",
    target: "Publish Q3 ungulate grazing spatial density report",
    timestamp: "6 days ago",
    iconType: "task",
  },
];
