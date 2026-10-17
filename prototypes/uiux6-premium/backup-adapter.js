/* Capability boundary for this partial reader/quiz renderer, after strict model validation. */
(() => {
  function check(text, content) {
    const result = PremiumModel.validateBackup(text);
    if (!result.ok) return result;
    const { reader, quiz } = result.data;
    if (!content.bibles[reader.translation]?.[reader.book]?.[reader.chapter])
      return {
        ok: false,
        error:
          "Die Leseposition liegt außerhalb der in dieser Designstudie mitgelieferten Kapitel. Es wurde nichts wiederhergestellt.",
      };
    if (quiz) {
      const unit = content.units[quiz.unitId];
      if (
        !unit ||
        quiz.index >= unit.questions.length ||
        Object.keys(quiz.answers).some(
          (i) => Number(i) >= unit.questions.length,
        )
      )
        return {
          ok: false,
          error:
            "Die Fragenposition passt nicht zum unveränderten Fragenbestand dieser Studie. Es wurde nichts wiederhergestellt.",
        };
    }
    return result;
  }
  globalThis.PremiumBackup = { check };
})();
