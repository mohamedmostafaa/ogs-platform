/**
 * UI smoke route — renders every @ogs/ui surface so we can visually
 * verify the design system on each deploy.
 *
 * NOT part of the production app — gated by a build-time flag in
 * Phase 02 so it stops being publicly reachable.
 */
"use client";

import { Briefcase } from "lucide-react";
import * as React from "react";

import { DEFAULT_PAGE_SIZE, type PageSize } from "@ogs/config";
import { AgentAvatar, UserAvatar } from "@ogs/ui/avatar";
import {
  DataTable,
  type DataTableColumn,
  EntityEmptyView,
  EntityHeader,
  EntityList,
  EntityPagination,
} from "@ogs/ui/entityx";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Separator,
  Skeleton,
} from "@ogs/ui/primitives";
import { ThemeToggle } from "@ogs/ui/theme";

interface SampleJob {
  id: string;
  title: string;
  company: string;
  location: string;
  status: "draft" | "published" | "closed";
}

const SAMPLE_JOBS: SampleJob[] = [
  {
    id: "j_001",
    title: "Senior Drilling Engineer",
    company: "Aramco",
    location: "Dhahran, SA",
    status: "published",
  },
  {
    id: "j_002",
    title: "MWD Specialist (Rotation)",
    company: "Halliburton",
    location: "Doha, QA",
    status: "published",
  },
  {
    id: "j_003",
    title: "HSE Lead — Subsea",
    company: "TechnipFMC",
    location: "Abu Dhabi, AE",
    status: "draft",
  },
];

const JOB_COLUMNS: DataTableColumn<SampleJob>[] = [
  { key: "title", header: "Job", cell: (j) => <span className="font-medium">{j.title}</span> },
  { key: "company", header: "Company", cell: (j) => j.company },
  {
    key: "location",
    header: "Location",
    cell: (j) => j.location,
    className: "text-muted-foreground",
  },
  {
    key: "status",
    header: "Status",
    cell: (j) => (
      <Badge variant={j.status === "published" ? "default" : "secondary"}>{j.status}</Badge>
    ),
  },
];

export function SmokeClient() {
  const [pageSize, setPageSize] = React.useState<PageSize>(DEFAULT_PAGE_SIZE as PageSize);

  return (
    <div className="mx-auto max-w-5xl space-y-10 p-8">
      <EntityHeader
        title="UI smoke"
        description="Every @ogs/ui surface rendered on one page — for visual regression."
        actions={
          <>
            <Button variant="outline" size="sm">
              Export
            </Button>
            <ThemeToggle />
          </>
        }
      />

      {/* --- Primitives ----------------------------------------------------- */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Primitives</h2>
        <Card>
          <CardHeader>
            <CardTitle>Form fragment</CardTitle>
            <CardDescription>Input + Label + Button.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="smoke-email">Email</Label>
              <Input id="smoke-email" type="email" placeholder="you@ogs-tc.com" />
            </div>
            <div className="flex items-center gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center gap-2">
          <Badge>default</Badge>
          <Badge variant="secondary">secondary</Badge>
          <Badge variant="outline">outline</Badge>
          <Badge variant="destructive">destructive</Badge>
        </div>
        <Separator />
        <Skeleton className="h-6 w-1/2" />
      </section>

      {/* --- Avatars ------------------------------------------------------- */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Avatars</h2>
        <div className="flex items-center gap-4">
          <UserAvatar name="Mohamed Mostafa" />
          <UserAvatar name="Khaled Al-Otaibi" size="lg" />
          <UserAvatar name="" email="someone@example.com" size="sm" />
          <AgentAvatar agent="careers_summarizer" glyph="C" />
          <AgentAvatar agent="academy_tutor" glyph="A" size="lg" />
          <AgentAvatar agent="skillpass_grader" />
        </div>
      </section>

      {/* --- EntityList ---------------------------------------------------- */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">EntityList</h2>
        <EntityList
          items={SAMPLE_JOBS}
          getKey={(j) => j.id}
          renderItem={(j) => (
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{j.title}</p>
                  <p className="text-muted-foreground text-sm">
                    {j.company} · {j.location}
                  </p>
                </div>
                <Badge variant={j.status === "published" ? "default" : "secondary"}>
                  {j.status}
                </Badge>
              </CardContent>
            </Card>
          )}
        />
      </section>

      {/* --- DataTable + Pagination --------------------------------------- */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">DataTable + Pagination</h2>
        <Card>
          <CardContent className="p-0">
            <DataTable data={SAMPLE_JOBS} columns={JOB_COLUMNS} getRowKey={(j) => j.id} />
          </CardContent>
        </Card>
        <EntityPagination
          totalCount={3}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          prevCursor={null}
          nextCursor={null}
          onNavigate={() => {
            /* smoke only */
          }}
        />
      </section>

      {/* --- EntityEmptyView ---------------------------------------------- */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">EntityEmptyView</h2>
        <EntityEmptyView
          icon={<Briefcase className="h-12 w-12" aria-hidden />}
          title="No open jobs yet"
          description="Posted jobs will show up here once a recruiter publishes one."
          action={<Button>Post a job</Button>}
        />
      </section>
    </div>
  );
}
