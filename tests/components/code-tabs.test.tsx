import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeTabs } from "@/components/learning/code-tabs";

const tabs = [
  { label: "AWS CLI", language: "bash", code: "aws iam create-role" },
  { label: "TypeScript", language: "ts", code: "new IAMClient({})" },
];

describe("CodeTabs", () => {
  it("shows the first tab's code by default", () => {
    render(<CodeTabs tabs={tabs} />);
    expect(screen.getByText("aws iam create-role")).toBeInTheDocument();
    expect(screen.queryByText("new IAMClient({})")).not.toBeInTheDocument();
  });

  it("switches code when another tab is clicked", async () => {
    const user = userEvent.setup();
    render(<CodeTabs tabs={tabs} />);
    await user.click(screen.getByRole("tab", { name: "TypeScript" }));
    expect(screen.getByText("new IAMClient({})")).toBeInTheDocument();
    expect(screen.queryByText("aws iam create-role")).not.toBeInTheDocument();
  });
});
