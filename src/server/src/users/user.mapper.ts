import { User } from './user.entity';

export function userToDto(u: User) {
  return {
    id:             u.user_id.toString(),
    username:       u.username,
    email:          u.email,
    name:           u.name,
    theme:          u.theme,
    createdAt:      u.created_at.toISOString(),
  };
}
