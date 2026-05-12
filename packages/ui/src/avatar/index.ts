/**
 * `@ogs/ui/avatar` — branded avatar components.
 *
 * For human users → {@link UserAvatar}.
 * For AI agents  → {@link AgentAvatar} (always shows the "AI" pill so
 * users can't mistake an agent for a human).
 */
export { AgentAvatar, type AgentAvatarProps } from "./agent-avatar";
export { UserAvatar, type UserAvatarProps } from "./user-avatar";
