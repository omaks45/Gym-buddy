/* eslint-disable prettier/prettier */
import { User } from "../models/user.model";

// Automatically exclude sensitive fields
export type SafeUser = Omit<User, 'password' | 'refreshToken'>;