using FocusArena.Application.Interfaces;
using FocusArena.Domain.Entities;
using FocusArena.Domain.Enums;
using FocusArena.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FocusArena.Infrastructure.Services;

public class GateService : IGateService
{
    private readonly ApplicationDbContext _context;

    public GateService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Gate>> GetUserGatesAsync(int userId)
    {
        return await _context.Gates
            .Include(g => g.Tasks)
            .Where(g => g.UserId == userId)
            .OrderByDescending(g => g.Status == GateStatus.Active)
            .ThenBy(g => g.CreatedAt)
            .ToListAsync();
    }

    public async Task<Gate?> GetGateAsync(int gateId)
    {
        return await _context.Gates
            .Include(g => g.Tasks)
            .FirstOrDefaultAsync(g => g.Id == gateId);
    }

    public async Task<Gate> CreateGateAsync(int userId, string title, string? description, GateRank rank, DateTime? deadline, string? bossName, string? type, int requiredLevel = 1, int recommendedPartySize = 1)
    {
        // Calculate Rewards based on Rank
        int xpReward = 0;
        int goldReward = 0;

        switch (rank)
        {
            case GateRank.E: xpReward = 200; goldReward = 100; break;
            case GateRank.D: xpReward = 500; goldReward = 250; break;
            case GateRank.C: xpReward = 1000; goldReward = 500; break;
            case GateRank.B: xpReward = 2000; goldReward = 1000; break;
            case GateRank.A: xpReward = 3500; goldReward = 2000; break;
            case GateRank.S: xpReward = 5000; goldReward = 5000; break;
        }

        var gate = new Gate
        {
            UserId = userId,
            Title = title,
            Description = description,
            BossName = bossName ?? "Dungeon Boss",
            Type = type ?? "Dungeon",
            Rank = rank,
            Deadline = deadline,
            Status = GateStatus.Active,
            CreatedAt = DateTime.UtcNow,
            XPReward = xpReward,
            GoldReward = goldReward,
            RequiredLevel = requiredLevel,
            RecommendedPartySize = recommendedPartySize
        };

        _context.Gates.Add(gate);
        await _context.SaveChangesAsync();
        return gate;
    }

    public async Task<bool> AddTaskToGateAsync(int gateId, int taskId)
    {
        var task = await _context.Tasks.FindAsync(taskId);
        if (task == null) return false;

        task.GateId = gateId;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CheckGateCompletionAsync(int gateId)
    {
        var gate = await _context.Gates
            .Include(g => g.Tasks)
            .FirstOrDefaultAsync(g => g.Id == gateId);

        if (gate == null || gate.Status != GateStatus.Active) return false;

        // Check if all tasks are completed
        bool allCompleted = gate.Tasks.Any() && gate.Tasks.All(t => t.Status == FocusArena.Domain.Enums.TaskStatus.Done);
        
        if (allCompleted)
        {
            // We don't verify rewards here, usually user has to manually "Claim" the Gate completion?
            // Or auto-complete?
            // Let's stick to "Cleared" status but require explicit Claim or just set Cleared.
            // Let's set Cleared status but NOT award yet? No, simpler to just set Cleared and allow Claim.
            // Actually, if we set Status = Cleared, then ClaimGateRewardsAsync needs to handle it.
            // Let's say CheckGateCompletion just updates status if needed.
            
            // Wait, if we update status to Cleared here, we might miss the "moment" of completion.
            // Let's leave Status as Active but logic elsewhere handles it?
            // "Cleared" status implies completed and rewards claimed?
            // Or "Cleared" = Done, "RewardsClaimed" = boolean?
            // Gate entity has Status: Active, Cleared, Failed.
            // Let's say Cleared means DONE and Rewards GIVEN.
            
            // So CheckGateCompletion checks logic but doesn't modify state?
            // Or maybe it returns true if ready to be cleared.
            return true;
        }

        return false;
    }

    public async Task<bool> ClaimGateRewardsAsync(int gateId, int userId)
    {
        var gate = await _context.Gates
            .Include(g => g.Tasks)
            .FirstOrDefaultAsync(g => g.Id == gateId && g.UserId == userId);

        if (gate == null || gate.Status != GateStatus.Active) return false;

        // Verify completion
        if (!gate.Tasks.Any() || gate.Tasks.Any(t => t.Status != FocusArena.Domain.Enums.TaskStatus.Done))
        {
            return false;
        }

        // Award
        var user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            user.XP += gate.XPReward;
            user.Gold += gate.GoldReward;
            
            // Mark gate as Cleared
            gate.Status = GateStatus.Cleared;
            gate.ClearedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        return false;
    }

    public async Task<List<Gate>> CreateGlobalGateAsync(string title, string? description, GateRank rank, DateTime? deadline, string? bossName, string? type, int requiredLevel = 1, int recommendedPartySize = 1)
    {
        var users = await _context.Users.ToListAsync();
        var gates = new List<Gate>();

        // Calculate Rewards based on Rank
        int xpReward = 0;
        int goldReward = 0;

        switch (rank)
        {
            case GateRank.E: xpReward = 200; goldReward = 100; break;
            case GateRank.D: xpReward = 500; goldReward = 250; break;
            case GateRank.C: xpReward = 1000; goldReward = 500; break;
            case GateRank.B: xpReward = 2000; goldReward = 1000; break;
            case GateRank.A: xpReward = 3500; goldReward = 2000; break;
            case GateRank.S: xpReward = 5000; goldReward = 5000; break;
        }

        foreach (var user in users)
        {
            var gate = new Gate
            {
                UserId = user.Id,
                Title = title,
                Description = description,
                BossName = bossName ?? "Dungeon Boss",
                Type = type ?? "Dungeon",
                Rank = rank,
                Deadline = deadline,
                Status = GateStatus.Active,
                CreatedAt = DateTime.UtcNow,
                XPReward = xpReward,
                GoldReward = goldReward,
                RequiredLevel = requiredLevel,
                RecommendedPartySize = recommendedPartySize
            };
            gates.Add(gate);
            _context.Gates.Add(gate);
        }

        await _context.SaveChangesAsync();
        return gates;
    }
}
