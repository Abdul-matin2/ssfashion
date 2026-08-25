/**
 * Clear all product data from Supabase database
 * Run with: npx tsx scripts/clear-database.ts
 */
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function clearDatabase() {
  console.log("Clearing database...");

  // Order matters due to foreign key constraints
  const tables = [
    "order_items",
    "orders",
    "cart_items",
    "wishlist_items",
    "notifications",
    "products",
    "coupons",
    "banner",
    "reviews",
  ];

  for (const table of tables) {
    const { error, count } = await supabase
      .from(table)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all rows

    if (error) {
      console.error(`Error clearing ${table}:`, error.message);
    } else {
      console.log(`Cleared ${table}`);
    }
  }

  console.log("Database cleared!");
}

clearDatabase().catch(console.error);