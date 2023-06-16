ALTER TABLE "file" ALTER COLUMN "created" SET DATA TYPE timestamp with time zone;
ALTER TABLE "file" ALTER COLUMN "modified" SET DATA TYPE timestamp with time zone;
ALTER TABLE "file_user_permissions" ALTER COLUMN "file_id" SET NOT NULL;
ALTER TABLE "file_user_permissions" ALTER COLUMN "user_id" SET NOT NULL;
ALTER TABLE "user_permissions" ALTER COLUMN "user_id" SET NOT NULL;