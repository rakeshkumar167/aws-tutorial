import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ServiceCard } from "@/components/catalog/service-card";

describe("ServiceCard", () => {
  it("links to the service page when available", () => {
    render(
      <ServiceCard
        categorySlug="security-identity"
        service={{ slug: "iam", title: "IAM", blurb: "Roles & policies", status: "available" }}
      />,
    );
    const link = screen.getByRole("link", { name: /IAM/ });
    expect(link).toHaveAttribute("href", "/services/iam");
  });

  it("renders a non-link coming-soon card when not available", () => {
    render(
      <ServiceCard
        categorySlug="compute"
        service={{ slug: "ec2", title: "EC2", blurb: "Instances", status: "coming-soon" }}
      />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText(/coming soon/i)).toBeInTheDocument();
  });
});
