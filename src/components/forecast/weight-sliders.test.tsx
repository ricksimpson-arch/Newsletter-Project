import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ForecastLab } from "@/components/forecast/forecast-lab";
import { franchises } from "@/data/franchises";

describe("ForecastLab weight sliders", () => {
  it("shows a live total of 100% under the research model", () => {
    render(<ForecastLab franchises={franchises} />);
    expect(screen.getByText(/Total 100\.0%/)).toBeInTheDocument();
  });

  it("renders one slider per criterion plus scenario controls", () => {
    render(<ForecastLab franchises={franchises} />);
    expect(screen.getByLabelText("Brand recognition weight")).toBeInTheDocument();
    expect(screen.getByLabelText("Competition / whitespace weight")).toBeInTheDocument();
    expect(screen.getByLabelText("Licensing-risk tolerance")).toBeInTheDocument();
  });

  it("applies the Family gifting preset and moves Astro Bot up the table", async () => {
    const user = userEvent.setup();
    render(<ForecastLab franchises={franchises} />);

    const astroRow = () => screen.getByTestId("scenario-row-astro-bot");
    expect(astroRow().getAttribute("data-rank")).toBe("4");

    await user.click(screen.getByTestId("preset-family-gifting"));
    expect(Number(astroRow().getAttribute("data-rank"))).toBeLessThan(4);
  });

  it("restores the research model exactly", async () => {
    const user = userEvent.setup();
    render(<ForecastLab franchises={franchises} />);
    await user.click(screen.getByTestId("preset-family-gifting"));
    await user.click(screen.getByTestId("restore-research-model"));
    expect(screen.getByTestId("scenario-row-helldivers-2").getAttribute("data-rank")).toBe("1");
    expect(screen.getByTestId("scenario-row-astro-bot").getAttribute("data-rank")).toBe("4");
  });
});
