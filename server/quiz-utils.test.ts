import { describe, expect, it } from "vitest";
import { badgeForProgress, isNewBadge, scoreSubmittedSession } from "./quiz-utils";

describe("scoreSubmittedSession", () => {
  it("calcule le score et la progression par thème côté serveur", () => {
    const result = scoreSubmittedSession([
      { id: "a", answers: ["Paris", "Lyon", "Nice", "Lille"], correctIndex: 0, themes: ["Géographie"] },
      { id: "b", answers: ["Mercure", "Mars", "Jupiter", "Vénus"], correctIndex: 0, themes: ["Science", "Culture"] },
    ], [
      { questionId: "a", answer: "Paris" },
      { questionId: "b", answer: "Mars" },
    ]);

    expect(result.score).toBe(1);
    expect(result.totalQuestions).toBe(2);
    expect(result.progressByTheme.get("Géographie")).toEqual({ attempted: 1, correct: 1 });
    expect(result.progressByTheme.get("Science")).toEqual({ attempted: 1, correct: 0 });
  });
});

describe("badges", () => {
  it("attribue les paliers de progression sans saut artificiel", () => {
    expect(badgeForProgress(4)).toBeNull();
    expect(badgeForProgress(5)).toMatchObject({ tier: "bronze" });
    expect(badgeForProgress(15)).toMatchObject({ tier: "silver" });
    expect(isNewBadge(4, 5)).toMatchObject({ tier: "bronze" });
    expect(isNewBadge(5, 9)).toBeNull();
  });
});
