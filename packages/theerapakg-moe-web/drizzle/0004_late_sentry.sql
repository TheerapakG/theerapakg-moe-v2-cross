ALTER TABLE "file_user_permissions" DROP CONSTRAINT "file_user_permissions_file_id_user_id_permission";--> statement-breakpoint
ALTER TABLE "user_permissions" DROP CONSTRAINT "user_permissions_user_id_permission";--> statement-breakpoint
ALTER TABLE "file_user_permissions" ADD CONSTRAINT "file_user_permissions_file_id_user_id_permission_pk" PRIMARY KEY("file_id","user_id","permission");--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_permission_pk" PRIMARY KEY("user_id","permission");--> statement-breakpoint
ALTER TABLE "file" ADD COLUMN "name" text;