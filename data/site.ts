export type Service = {
  slug: string; n: string; icon: string; title: string; desc: string;
  lead: string; image: string; scope: string[]; applications: string[]; process: string[];
};
export type Project = {
  slug: string; title: string; type: "Civil Works" | "Commercial" | "Residential";
  image: string; alt: string; summary: string; challenge: string; solution: string;
  scope: string[]; considerations: string[];
};

export const services: Service[] = [
  { slug: "building-construction", n: "01", icon: "▥", title: "Building Construction",
    desc: "Purpose-built residential, commercial and industrial spaces delivered with precision and care.",
    lead: "From foundations to finishing, bring structure and clarity to every stage of the building process.",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1800&q=85",
    scope: ["New-build planning and construction", "Commercial and industrial structures", "Residential building works", "Structural coordination and finishing", "Quality checks and project handover"],
    applications: ["New developments", "Building extensions", "Commercial fit-outs"],
    process: ["Discuss the brief and site conditions", "Confirm scope and sequencing", "Coordinate execution and quality checks"] },
  { slug: "civil-engineering", n: "02", icon: "⌁", title: "Civil Engineering",
    desc: "Roadworks, drainage, earthworks and essential infrastructure for connected communities.",
    lead: "Practical civil works concepts that connect projects with the infrastructure they depend on.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=85",
    scope: ["Earthworks and excavation", "Roadworks and paving", "Stormwater and drainage systems", "Concrete and retaining structures", "Site access and infrastructure preparation"],
    applications: ["Site infrastructure", "Access routes", "Land development"],
    process: ["Review drawings and survey requirements", "Assess site access and sequencing", "Coordinate civil works and inspections"] },
  { slug: "materials-supply", n: "03", icon: "▤", title: "Construction Materials",
    desc: "Practical sourcing and coordinated supply of essential materials for demanding construction projects.",
    lead: "Keep the build moving with a clearer approach to materials requirements and delivery planning.",
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1800&q=85",
    scope: ["Aggregates, sand and stone", "Cement and concrete materials", "Bricks, blocks and masonry", "General building materials", "Quantity planning and delivery coordination"],
    applications: ["Residential builds", "Civil works", "Commercial projects"],
    process: ["Share quantities and specifications", "Review availability and lead times", "Plan delivery around project milestones"] },
  { slug: "project-management", n: "04", icon: "▦", title: "Project Management",
    desc: "From the first brief to handover, coordinated programmes and clear project communication.",
    lead: "Make complex delivery easier to understand through structured planning and consistent oversight.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=85",
    scope: ["Project scope and milestone planning", "Supplier and trade coordination", "Progress reporting structures", "Quality and risk tracking", "Handover and close-out planning"],
    applications: ["Multi-trade construction", "Programme coordination", "Delivery oversight"],
    process: ["Define deliverables and responsibilities", "Build a practical delivery schedule", "Track progress and communicate changes"] },
  { slug: "renovations-upgrades", n: "05", icon: "⌂", title: "Renovations & Upgrades",
    desc: "Thoughtful refurbishment that gives existing structures and spaces new purpose.",
    lead: "Transform existing buildings through coordinated refurbishment and focused improvements.",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85",
    scope: ["Building alterations", "Interior and exterior upgrades", "Refurbishment planning", "Finishes and fit-outs", "Phased works around occupied spaces"],
    applications: ["Office upgrades", "Residential renovations", "Commercial refurbishments"],
    process: ["Assess existing conditions", "Define upgrade priorities and constraints", "Plan phased delivery and finishes"] },
  { slug: "site-preparation", n: "06", icon: "△", title: "Site Preparation",
    desc: "Groundworks, site establishment and the critical early stages of a successful build.",
    lead: "A strong project starts with a well-prepared site and a clear plan for mobilisation.",
    image: "https://images.unsplash.com/photo-1531835551805-16d864c8d311?auto=format&fit=crop&w=1800&q=85",
    scope: ["Site establishment concepts", "Clearing and preparation", "Excavation and grading", "Access and temporary works planning", "Groundworks coordination"],
    applications: ["New construction", "Civil projects", "Site development"],
    process: ["Review access and ground conditions", "Identify site constraints", "Sequence preparation before main works"] }
];

export const projects: Project[] = [
  { slug: "commercial-development", title: "Commercial Developments", type: "Commercial",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=85",
    alt: "Modern commercial buildings in a city", summary: "A concept showcase for professional commercial construction and workplace environments.",
    challenge: "Commercial developments depend on coordinated trades, clear milestones and a durable end result.",
    solution: "The example approach combines build planning, structural coordination, finishes and disciplined handover.",
    scope: ["Construction programme planning", "Structural and building works", "Multi-trade coordination", "Finishes and handover planning"],
    considerations: ["Safe site access", "Quality and inspection milestones", "Supplier lead times"] },
  { slug: "infrastructure-earthworks", title: "Infrastructure & Earthworks", type: "Civil Works",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1800&q=85",
    alt: "Construction equipment and workers at a site", summary: "An illustrative infrastructure project focused on site readiness and civil works.",
    challenge: "Civil works require careful sequencing around terrain, access, drainage and site conditions.",
    solution: "The sample scope outlines a structured progression from preparation through to civil infrastructure installation.",
    scope: ["Earthworks and grading", "Road and access preparation", "Drainage coordination", "Concrete works"],
    considerations: ["Ground conditions", "Access for equipment", "Weather and programme impacts"] },
  { slug: "residential-spaces", title: "Residential Spaces", type: "Residential",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85",
    alt: "Contemporary residential interior", summary: "A residential building and refurbishment concept centred on thoughtful spaces.",
    challenge: "Homes must balance everyday function, material choices, finishes and build quality.",
    solution: "The concept emphasises early requirements gathering, material selection and coordinated finishing.",
    scope: ["Building and renovation scope", "Interior and exterior finishes", "Materials coordination", "Snagging and handover"],
    considerations: ["Occupant needs", "Budget-sensitive material choices", "Finish quality"] },
  { slug: "site-structural-works", title: "Site & Structural Works", type: "Civil Works",
    image: "https://images.unsplash.com/photo-1531835551805-16d864c8d311?auto=format&fit=crop&w=1800&q=85",
    alt: "Construction equipment at an active worksite", summary: "A sample site and structural coordination showcase for early-stage construction.",
    challenge: "Site and structural work sets the foundation for every downstream construction activity.",
    solution: "The example methodology follows a practical sequence from mobilisation through structural readiness.",
    scope: ["Site establishment", "Earthworks and foundation preparation", "Structural work coordination", "Inspection and quality milestones"],
    considerations: ["Approved engineering details", "Safe work sequencing", "Material delivery access"] }
];

export const workflow = [
  { n: "01", name: "Discover", summary: "Understand the brief, site and outcomes.", detail: "Capture requirements, site location, intended use, budget considerations and key constraints before proposing a route forward." },
  { n: "02", name: "Plan", summary: "Turn the brief into a delivery pathway.", detail: "Outline scope, dependencies, sequencing, materials, trade responsibilities and communication milestones." },
  { n: "03", name: "Build", summary: "Coordinate execution and quality.", detail: "Track progress, surface issues early, coordinate site activities and document decisions as the work develops." },
  { n: "04", name: "Deliver", summary: "Close out with clarity.", detail: "Review deliverables, address outstanding items and prepare clear handover information." }
];
