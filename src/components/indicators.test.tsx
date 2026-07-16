import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  ConfidenceIndicator,
  MetricValue,
  RecommendationBadge,
  SourceTierBadge,
} from "@/components/indicators";

describe("ConfidenceIndicator", () => {
  it("shows band as text plus the number (never color alone)", () => {
    render(<ConfidenceIndicator score={85} />);
    expect(screen.getByText(/High confidence · 85/)).toBeInTheDocument();
  });

  it("labels medium and low bands", () => {
    const { rerender } = render(<ConfidenceIndicator score={65} />);
    expect(screen.getByText(/Medium confidence · 65/)).toBeInTheDocument();
    rerender(<ConfidenceIndicator score={45} />);
    expect(screen.getByText(/Low confidence · 45/)).toBeInTheDocument();
  });
});

describe("SourceTierBadge", () => {
  it("renders tier labels with an explanatory title", () => {
    render(<SourceTierBadge tier="tier-1" />);
    expect(screen.getByTitle(/Tier 1 — official\/publisher data/)).toHaveTextContent("T1");
  });

  it("marks modeled values distinctly", () => {
    render(<SourceTierBadge tier="modeled" />);
    expect(screen.getByTitle(/internal calculation/i)).toHaveTextContent(/modeled/i);
  });
});

describe("MetricValue", () => {
  it("renders null as “Not publicly reported” — never zero", () => {
    render(<MetricValue value={null} />);
    expect(screen.getByText("Not publicly reported")).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("formats numbers with locale separators and units", () => {
    render(<MetricValue value={458709} unit="players" />);
    expect(screen.getByText("458,709")).toBeInTheDocument();
    expect(screen.getByText("players")).toBeInTheDocument();
  });
});

describe("RecommendationBadge", () => {
  it("writes the label out as text", () => {
    render(<RecommendationBadge level="strong-pursuit" />);
    expect(screen.getByText("Strong Pursuit")).toBeInTheDocument();
  });
});
