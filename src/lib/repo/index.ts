import "server-only";
import { isSupabaseConfigured } from "../config";
import { memoryRepo } from "./memory";
import { supabaseRepo } from "./supabase";
import type { Repo } from "./types";

export const repo = (): Repo => (isSupabaseConfigured() ? supabaseRepo : memoryRepo);
