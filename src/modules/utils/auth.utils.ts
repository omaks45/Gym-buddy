/* eslint-disable prettier/prettier */
import * as bcrypt from 'bcrypt';
//import * as crypto from 'crypto';

/**
 * Password utility functions
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

export const comparePasswords = async (plain: string, hashed: string): Promise<boolean> => {
  return bcrypt.compare(plain, hashed);
};

/**
 * Token generation utilities
 */
export const generateVerificationToken = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // generates a number between 100000 and 999999
};


export const generateResetToken = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // generates a number between 100000 and 999999
};


/**
 * Date utilities for token expiration
 */
export const getVerificationTokenExpiry = (): Date => {
  const date = new Date();
  date.setHours(date.getHours() + 24); // 24 hours from now
  return date;
};

export const getResetTokenExpiry = (): Date => {
  const date = new Date();
  date.setHours(date.getHours() + 1); // 1 hour from now
  return date;
};