DO $$ BEGIN
 CREATE TYPE "filepermission" AS ENUM('file!:view', 'file!:edit');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "userpermission" AS ENUM('sh:list', 'sh:edit', 'file:list', 'file:view', 'file:edit', 'container:list', 'container:inspect', 'container:manage', 'migrate');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "container" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner" uuid NOT NULL,
	"docker_id" varchar(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS "file" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dir" text NOT NULL,
	"owner" uuid NOT NULL,
	"created" timestamp NOT NULL,
	"modified" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "file_user_permissions" (
	"file_id" uuid,
	"user_id" uuid,
	"permission" filepermission NOT NULL
);
--> statement-breakpoint
ALTER TABLE "file_user_permissions" ADD CONSTRAINT "file_user_permissions_file_id_user_id_permission" PRIMARY KEY("file_id","user_id","permission");

CREATE TABLE IF NOT EXISTS "sh" (
	"from" text PRIMARY KEY NOT NULL,
	"to" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phash" varchar(256)
);

CREATE TABLE IF NOT EXISTS "user_permissions" (
	"user_id" uuid,
	"permission" userpermission NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_permission" PRIMARY KEY("user_id","permission");

CREATE INDEX IF NOT EXISTS "container_owner_idx" ON "container" ("owner");
CREATE UNIQUE INDEX IF NOT EXISTS "container_docker_id_idx" ON "container" ("docker_id");
CREATE INDEX IF NOT EXISTS "file_owner_idx" ON "file" ("owner");
CREATE INDEX IF NOT EXISTS "file_user_permissions_file_id_user_id_idx" ON "file_user_permissions" ("user_id","file_id");
CREATE INDEX IF NOT EXISTS "file_user_permissions_file_id_permission_idx" ON "file_user_permissions" ("file_id","permission");
CREATE UNIQUE INDEX IF NOT EXISTS "user_name_idx" ON "user" ("name");
CREATE INDEX IF NOT EXISTS "user_permissions_user_id_idx" ON "user_permissions" ("user_id");
CREATE INDEX IF NOT EXISTS "user_permissions_permission_idx" ON "user_permissions" ("permission");
DO $$ BEGIN
 ALTER TABLE "container" ADD CONSTRAINT "container_owner_user_id_fk" FOREIGN KEY ("owner") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "file" ADD CONSTRAINT "file_owner_user_id_fk" FOREIGN KEY ("owner") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "file_user_permissions" ADD CONSTRAINT "file_user_permissions_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "file"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "file_user_permissions" ADD CONSTRAINT "file_user_permissions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
