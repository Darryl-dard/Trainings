-- CreateTable
CREATE TABLE "members"
(
    "id"         UUID         NOT NULL,
    "first_name" TEXT         NOT NULL,
    "last_name"  TEXT         NOT NULL,
    "email"      TEXT         NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "members" ("email");
