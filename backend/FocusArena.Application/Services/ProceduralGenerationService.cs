using FocusArena.Application.Interfaces;
using FocusArena.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FocusArena.Application.Services;

public class ProceduralGenerationService : IProceduralGenerationService
{
    private class CategoryData
    {
        public string[] Keywords { get; set; } = Array.Empty<string>();
        public string[] BossNames { get; set; } = Array.Empty<string>();
        public string[] LoreTemplates { get; set; } = Array.Empty<string>();
    }

    private static readonly Dictionary<string, CategoryData> Taxonomy = new(StringComparer.OrdinalIgnoreCase)
    {
        {
            "Coding", new CategoryData
            {
                Keywords = new[] { "code", "coding", "bug", "feature", "api", "backend", "frontend", "debug", "refactor", "deploy", "git" },
                BossNames = new[] { "Bug Swarm", "Syntax Terror", "Null Reference Leviathan", "Spaghetti Code Behemoth", "Merge Conflict Demon" },
                LoreTemplates = new[] {
                    "A digital anomaly born from unresolved logic. Defeat {0} before it corrupts your repository.",
                    "The system has spawned {0} due to excessive technical debt. Purge it to restore stability."
                }
            }
        },
        {
            "Fitness", new CategoryData
            {
                Keywords = new[] { "gym", "workout", "run", "exercise", "lift", "cardio", "stretch", "yoga" },
                BossNames = new[] { "Iron Golem", "Exhaustion Specter", "Lactic Acid Slime", "Sedentary Demon", "The Wall" },
                LoreTemplates = new[] {
                    "Physical limits manifest as {0}. Break through this barrier to level up your stamina.",
                    "A manifestation of laziness has taken the form of {0}. Crush it to claim your physical gains."
                }
            }
        },
        {
            "Study", new CategoryData
            {
                Keywords = new[] { "study", "read", "book", "learn", "homework", "exam", "assignment", "course" },
                BossNames = new[] { "Procrastination Demon", "Exam Anxiety Wraith", "Distraction Imp", "The Blank Page", "Fog of Ignorance" },
                LoreTemplates = new[] {
                    "Your lack of focus has coalesced into {0}. Slay it to achieve mental clarity.",
                    "{0} guards the gates of knowledge. Defeat it to absorb the wisdom within."
                }
            }
        },
        {
            "Finance", new CategoryData
            {
                Keywords = new[] { "pay", "bill", "finance", "budget", "tax", "money", "bank", "expense" },
                BossNames = new[] { "The Debt Collector", "Inflation Dragon", "Impulse Buy Goblin", "Financial Ruin Phantom" },
                LoreTemplates = new[] {
                    "{0} threatens your material wealth. Defeat it to secure your treasury.",
                    "An economic anomaly known as {0} has appeared. Slay it for a massive gold bounty."
                }
            }
        },
        {
            "Chores", new CategoryData
            {
                Keywords = new[] { "clean", "wash", "chore", "laundry", "dishes", "sweep", "groceries", "errand" },
                BossNames = new[] { "Dust Elemental", "The Clutter Abomination", "Stain Slime", "Procrastination Behemoth" },
                LoreTemplates = new[] {
                    "The chaos of your living space has summoned {0}. Restore order by defeating it.",
                    "{0} feeds on untidiness. Eliminate it to purify your sanctuary."
                }
            }
        }
    };

    private static readonly string[] GenericBosses = new[]
    {
        "Shadow Knight", 
        "Goblin King", 
        "Slime Monarch", 
        "Orc Warlord", 
        "Restless Soul",
        "Abyssal Watcher",
        "Void Wanderer"
    };

    private static readonly string[] GenericLore = new[]
    {
        "A spatial rift has opened, releasing {0} into your domain. Neutralize the threat.",
        "Sensors detect massive magical energy coalescing into {0}. Prepare for battle.",
        "{0} has emerged from the abyss. Slay it to claim the dimensional rewards."
    };

    public (string BossName, string LoreDescription) GenerateAnomalyLore(IEnumerable<string> taskTitles, GateRank rank)
    {
        var random = new Random();
        string categoryMatch = null;

        if (taskTitles != null && taskTitles.Any())
        {
            var allWords = taskTitles
                .SelectMany(t => t.Split(new[] { ' ', ',', '.', '!' }, StringSplitOptions.RemoveEmptyEntries))
                .Select(w => w.ToLowerInvariant())
                .ToList();

            // Find the first matching category based on keywords
            foreach (var word in allWords)
            {
                var match = Taxonomy.FirstOrDefault(t => t.Value.Keywords.Contains(word));
                if (match.Key != null)
                {
                    categoryMatch = match.Key;
                    break;
                }
            }
        }

        string baseBossName;
        string loreTemplate;

        if (categoryMatch != null && Taxonomy.TryGetValue(categoryMatch, out var data))
        {
            baseBossName = GetRandomElement(data.BossNames, random);
            loreTemplate = GetRandomElement(data.LoreTemplates, random);
        }
        else
        {
            baseBossName = GetRandomElement(GenericBosses, random);
            loreTemplate = GetRandomElement(GenericLore, random);
        }

        // Apply Rank Modifiers
        string bossName = ApplyRankModifier(baseBossName, rank, random);
        string loreDescription = string.Format(loreTemplate, bossName);

        return (bossName, loreDescription);
    }

    private string ApplyRankModifier(string baseName, GateRank rank, Random random)
    {
        string modifier = "";
        switch (rank)
        {
            case GateRank.E:
                modifier = GetRandomElement(new[] { "Weak ", "Lesser ", "Injured " }, random);
                break;
            case GateRank.D:
                // Normal names
                break;
            case GateRank.C:
                modifier = GetRandomElement(new[] { "Fierce ", "Armored ", "Swift " }, random);
                break;
            case GateRank.B:
                modifier = GetRandomElement(new[] { "Dire ", "Corrupted ", "Elite " }, random);
                break;
            case GateRank.A:
                modifier = GetRandomElement(new[] { "Supreme ", "Dreadful ", "Awakened " }, random);
                break;
            case GateRank.S:
                modifier = GetRandomElement(new[] { "Ancient ", "Calamity ", "The Primordial " }, random);
                break;
        }

        return $"{modifier}{baseName}";
    }

    public (int BossMaxHp, int XpReward, int GoldReward, int RequiredLevel, int RecommendedPartySize) GenerateBossStats(GateRank rank, int playerLevel)
    {
        var random = new Random();
        
        // Multiplier based on rank (E = 1, S = 6)
        double rankMultiplier = (int)rank + 1;
        
        // Base modifiers
        double levelBonus = 1.0 + (playerLevel * 0.1);

        int maxHp = (int)(100 * rankMultiplier * levelBonus * (1.0 + (random.NextDouble() * 0.2 - 0.1)));
        int xp = (int)(25 * rankMultiplier * levelBonus * (1.0 + (random.NextDouble() * 0.2)));
        int gold = (int)(10 * rankMultiplier * levelBonus * (1.0 + (random.NextDouble() * 0.3)));

        // Ensure minimums
        xp = Math.Max(10, xp);
        gold = Math.Max(5, gold);
        maxHp = Math.Max(50, maxHp);

        int requiredLevel = Math.Max(1, playerLevel + (int)rank - 2);
        int recommendedPartySize = (int)rank >= 3 ? (int)rank : 1; // Rank B+ requires 3+, S requires 5

        return (maxHp, xp, gold, requiredLevel, recommendedPartySize);
    }

    private T GetRandomElement<T>(T[] array, Random random)
    {
        return array[random.Next(array.Length)];
    }
}
