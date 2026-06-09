import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { CasesToolbar } from "@/components/features/cases/cases-toolbar";
import { BulkCaseActionsBar } from "@/components/features/cases/bulk-case-actions-bar";

jest.mock("lucide-react", () => {
  const ReactForMock = jest.requireActual<typeof React>("react");
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        const Icon = (props: React.SVGProps<SVGSVGElement>) =>
          ReactForMock.createElement("svg", {
            ...props,
            "data-icon": String(prop),
          });
        return Icon;
      },
    }
  );
});

const labels = {
  all: "All",
  search: "Search cases",
  type: "Type",
  allTypes: "All types",
  sortBy: "Sort by",
  updated: "Updated",
  created: "Created",
  title: "Title",
  status: "Status",
  cards: "Cards",
  table: "Table",
  clear: "Clear filters",
};

function renderToolbar(overrides = {}) {
  const props = {
    statusFilter: "all",
    typeFilter: "all",
    searchTerm: "",
    viewMode: "cards" as const,
    sortKey: "updated" as const,
    sortDir: "desc" as const,
    counts: { all: 3, open: 1, in_progress: 1, pending_hearing: 0, closed: 1, archived: 0 },
    isRTL: false,
    onStatusChange: jest.fn(),
    onTypeChange: jest.fn(),
    onSearchChange: jest.fn(),
    onViewModeChange: jest.fn(),
    onSortKeyChange: jest.fn(),
    onToggleSortDir: jest.fn(),
    onClearFilters: jest.fn(),
    formatStatus: (status: string) => status.replace(/_/g, " "),
    formatCaseType: (caseType: string) => caseType.replace(/_/g, " "),
    labels,
    ...overrides,
  };

  render(<CasesToolbar {...props} />);
  return props;
}

describe("Cases workspace controls", () => {
  it("emits search and view changes from the toolbar", () => {
    const props = renderToolbar();

    fireEvent.change(screen.getByPlaceholderText("Search cases"), {
      target: { value: "labor" },
    });
    expect(props.onSearchChange).toHaveBeenCalledWith("labor");

    fireEvent.click(screen.getByLabelText("Table"));
    expect(props.onViewModeChange).toHaveBeenCalledWith("table");
  });

  it("shows clear filters when filters are active", () => {
    const props = renderToolbar({ searchTerm: "civil" });

    fireEvent.click(screen.getByText("Clear filters"));
    expect(props.onClearFilters).toHaveBeenCalledTimes(1);
  });

  it("hides the bulk bar when nothing is selected", () => {
    render(
      <BulkCaseActionsBar
        selectedCount={0}
        canAssign
        teamMembers={[]}
        isBusy={false}
        isRTL={false}
        onClear={jest.fn()}
        onAssign={jest.fn()}
        onStatusChange={jest.fn()}
        onDelete={jest.fn()}
        formatStatus={(status) => status}
        labels={{
          selected: "{{count}} cases selected",
          clear: "Clear filters",
          assign: "Assign",
          unassign: "Unassign",
          selectLawyer: "Select lawyer",
          changeStatus: "Change status",
          delete: "Delete",
        }}
      />
    );

    expect(screen.queryByText("0 cases selected")).not.toBeInTheDocument();
  });

  it("emits bulk delete from the visible bulk bar", () => {
    const onDelete = jest.fn();
    render(
      <BulkCaseActionsBar
        selectedCount={2}
        canAssign={false}
        teamMembers={[]}
        isBusy={false}
        isRTL={false}
        onClear={jest.fn()}
        onAssign={jest.fn()}
        onStatusChange={jest.fn()}
        onDelete={onDelete}
        formatStatus={(status) => status}
        labels={{
          selected: "{{count}} cases selected",
          clear: "Clear filters",
          assign: "Assign",
          unassign: "Unassign",
          selectLawyer: "Select lawyer",
          changeStatus: "Change status",
          delete: "Delete",
        }}
      />
    );

    expect(screen.getByText("2 cases selected")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Delete"));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
