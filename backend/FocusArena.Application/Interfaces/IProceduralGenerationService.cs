using FocusArena.Domain.Entities;
using System.Collections.Generic;

namespace FocusArena.Application.Interfaces;

public interface IProceduralGenerationService
{
    /// <summary>
    /// Analyzes user task history/titles and generates a customized Dungeon Boss name and Lore Description.
    /// </summary>
    (string BossName, string LoreDescription) GenerateAnomalyLore(IEnumerable<string> taskTitles, GateRank rank);

    /// <summary>
    /// Generates randomized stats for a given boss target level.
    /// </summary>
    (int BossMaxHp, int XpReward, int GoldReward, int RequiredLevel, int RecommendedPartySize) GenerateBossStats(GateRank rank, int playerLevel);
}
