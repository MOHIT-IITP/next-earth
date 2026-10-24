"use client";

import * as React from "react";

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  biome: string;
  status: "active" | "archived" | "field-study";
  specimensCount: number;
  updatedAt: string;
  accent: "terracotta" | "olive" | "sand" | "charcoal";
}

const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-01",
    name: "Serengeti Savanna Corridor",
    slug: "serengeti-savanna-corridor",
    description: "Multi-trophic canopy analysis and perennial grass density tracking across the Mara divide.",
    biome: "Tropical Grassland",
    status: "active",
    specimensCount: 142,
    updatedAt: "2 hours ago",
    accent: "terracotta",
  },
  {
    id: "proj-02",
    name: "Alpine High Meadows Survey",
    slug: "alpine-high-meadows-survey",
    description: "Permafrost melt impact on sub-alpine floral phenology and mycorrhizal resilience.",
    biome: "Montane Meadow",
    status: "active",
    specimensCount: 89,
    updatedAt: "Yesterday",
    accent: "olive",
  },
  {
    id: "proj-03",
    name: "Mediterranean Maritime Forest",
    slug: "mediterranean-maritime-forest",
    description: "Drought-adapted Quercus ilex seedling regeneration and soil hydration mapping.",
    biome: "Coastal Sclerophyll",
    status: "field-study",
    specimensCount: 63,
    updatedAt: "3 days ago",
    accent: "sand",
  },
  {
    id: "proj-04",
    name: "Patagonia Glacial Peatland",
    slug: "patagonia-glacial-peatland",
    description: "Sphagnum carbon flux metrics and hydrological retention under microclimate shifts.",
    biome: "Subpolar Mire",
    status: "active",
    specimensCount: 31,
    updatedAt: "5 days ago",
    accent: "charcoal",
  },
];

interface ProjectsContextType {
  projects: Project[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  createProject: (data: { name: string; biome: string; description: string; accent?: Project["accent"] }) => Project;
}

const ProjectsContext = React.createContext<ProjectsContextType | undefined>(undefined);

const PROJECTS_STORAGE_KEY = "earth_projects_v1";

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = React.useState<Project[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = React.useState<string | null>("proj-01");

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (stored) {
        setProjects(JSON.parse(stored));
      }
    } catch {
      // Use defaults if storage access fails
    }
  }, []);

  const createProject = ({
    name,
    biome,
    description,
    accent = "terracotta",
  }: {
    name: string;
    biome: string;
    description: string;
    accent?: Project["accent"];
  }): Project => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name,
      slug,
      description,
      biome,
      status: "active",
      specimensCount: 0,
      updatedAt: "Just now",
      accent,
    };

    const updated = [newProject, ...projects];
    setProjects(updated);
    setActiveProjectId(newProject.id);

    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }

    return newProject;
  };

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        activeProjectId,
        setActiveProjectId,
        createProject,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const context = React.useContext(ProjectsContext);
  if (!context) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
}
