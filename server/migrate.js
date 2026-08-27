import "dotenv/config";



import bcrypt from "bcryptjs";

import supabase from "./supabase.js";

import path from "path";

import { fileURLToPath } from "url";


/* =========================================================
   PATH
========================================================= */

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);




/* =========================================================
   SQLITE
========================================================= */





/* =========================================================
   CHECK SUPABASE
========================================================= */

async function checkSupabase() {

    const { data, error } =
        await supabase
            .from("content")
            .select("id")
            .limit(1);

    if (error) {

        throw new Error(
            `Supabase connection failed: ${error.message}`
        );

    }

    console.log(
        "✅ Supabase database connection successful"
    );
}


/* =========================================================
   MIGRATE USERS
========================================================= */

async function migrateUsers() {

    const users =
        sqlite
            .prepare(
                "SELECT * FROM users"
            )
            .all();

    console.log(
        `\nUsers found: ${users.length}`
    );

    for (const user of users) {

        const { error } =
            await supabase
                .from("users")
                .upsert(
                    {
                        email: user.email,
                        password: user.password,
                        role:
                            user.role ||
                            "admin"
                    },
                    {
                        onConflict: "email"
                    }
                );

        if (error) {

            console.error(
                `❌ User migration failed: ${user.email}`,
                error.message
            );

        } else {

            console.log(
                `✅ User migrated: ${user.email}`
            );

        }

    }

}


/* =========================================================
   MIGRATE PROFILE
========================================================= */

async function migrateProfile() {

    const profile =
        sqlite
            .prepare(
                "SELECT * FROM profile WHERE id=1"
            )
            .get();

    if (!profile) {

        console.log(
            "\n⚠️ No SQLite profile found"
        );

        return;

    }

    let data = {};

    try {

        data =
            JSON.parse(
                profile.data || "{}"
            );

    } catch {

        console.log(
            "⚠️ Could not parse SQLite profile"
        );

    }

    const { error } =
        await supabase
            .from("profile")
            .upsert(
                {
                    id: 1,
                    data
                },
                {
                    onConflict: "id"
                }
            );

    if (error) {

        console.error(
            "❌ Profile migration failed:",
            error.message
        );

    } else {

        console.log(
            "✅ Profile migrated"
        );

    }

}


/* =========================================================
   MIGRATE CONTENT
========================================================= */

async function migrateContent() {

    const rows =
        sqlite
            .prepare(`
                SELECT
                    id,
                    resource,
                    title,
                    data,
                    created_at,
                    updated_at
                FROM content
                ORDER BY id ASC
            `)
            .all();

    console.log(
        `\nContent rows found: ${rows.length}`
    );

    const resources = {};

    for (const row of rows) {

        if (!resources[row.resource]) {

            resources[row.resource] = 0;

        }

        resources[row.resource]++;

        let data = {};

        try {

            data =
                JSON.parse(
                    row.data || "{}"
                );

        } catch {

            console.error(
                `❌ Invalid JSON for ${row.resource} #${row.id}`
            );

            continue;

        }

        /*
         * We intentionally don't preserve the SQLite ID.
         *
         * Supabase generates a new PostgreSQL ID.
         *
         * The frontend only needs the returned ID,
         * so this is safe.
         */

        const record = {

            resource:
                row.resource,

            title:
                row.title ||
                data.title ||
                "Untitled",

            data,

            created_at:
                row.created_at ||
                new Date().toISOString(),

            updated_at:
                row.updated_at ||
                new Date().toISOString()

        };


        const { error } =
            await supabase
                .from("content")
                .insert(record);


        if (error) {

            console.error(
                `❌ Failed ${row.resource} #${row.id}:`,
                error.message
            );

        } else {

            console.log(
                `✅ ${row.resource}: ${row.title}`
            );

        }

    }


    console.log(
        "\nContent summary:"
    );

    for (
        const [resource, count]
        of Object.entries(resources)
    ) {

        console.log(
            `  ${resource}: ${count}`
        );

    }

}


/* =========================================================
   MAIN
========================================================= */

async function migrate() {

    try {

        await checkSupabase();

        await migrateUsers();

        await migrateProfile();

        await migrateContent();

        console.log(
            "\n================================="
        );

        console.log(
            "🎉 MIGRATION COMPLETED"
        );

        console.log(
            "================================="
        );

        console.log(
            "\nYour SQLite data is now in Supabase."
        );

        console.log(
            "Do NOT delete portfolio.db yet."
        );

    } catch (error) {

        console.error(
            "\n❌ MIGRATION FAILED"
        );

        console.error(
            error
        );

        process.exit(1);

    } finally {

        sqlite.close();

    }

}


migrate();