import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SubmissionForm } from "@/components/board/submission-form";

describe("SubmissionForm", () => {
  it("shows field errors instead of submitting when required fields are empty", async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<SubmissionForm />);

    await user.click(screen.getByRole("button", { name: /submit via github/i }));

    expect(open).not.toHaveBeenCalled();
    expect(screen.getByText("Game name is required")).toBeInTheDocument();
    expect(screen.getByText(/at least 30 characters/i)).toBeInTheDocument();
    open.mockRestore();
  });

  it("opens the prefilled GitHub issue for a valid submission", async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<SubmissionForm />);

    await user.type(screen.getByLabelText(/game name/i), "Cosmic Diner");
    await user.type(screen.getByLabelText(/studio name/i), "Tiny Fork Studio");
    await user.type(screen.getByLabelText(/contact/i), "dev@tinyfork.example");
    await user.type(
      screen.getByLabelText(/tell us about your game/i),
      "A co-op cooking roguelike where every customer is an alien with strong opinions about soup."
    );
    await user.click(screen.getByRole("button", { name: /submit via github/i }));

    expect(open).toHaveBeenCalledTimes(1);
    const url = String(open.mock.calls[0][0]);
    expect(url).toContain("github.com/ricksimpson-arch/Newsletter-Project/issues/new");
    expect(url).toContain("Cosmic+Diner"); // URLSearchParams encodes spaces as +
    open.mockRestore();
  });
});
