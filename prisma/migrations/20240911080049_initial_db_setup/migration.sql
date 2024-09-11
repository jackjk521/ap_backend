-- CreateTable
CREATE TABLE "estates" (
    "id" SERIAL NOT NULL,
    "estate_name" TEXT NOT NULL DEFAULT '',
    "total_units" INTEGER NOT NULL DEFAULT 0,
    "property_type" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estate_residents" (
    "id" SERIAL NOT NULL,
    "estate_id" INTEGER NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "account_code" VARCHAR(50) NOT NULL,
    "block" VARCHAR(10) NOT NULL,
    "unit_no" VARCHAR(10) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "resident_type" VARCHAR(20) NOT NULL,
    "contact_no" VARCHAR(20) NOT NULL,

    CONSTRAINT "estate_residents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" VARCHAR(100) NOT NULL,
    "username" TEXT NOT NULL,
    "contact_no" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concerns" (
    "id" SERIAL NOT NULL,
    "estate_id" INTEGER NOT NULL,
    "concern_name" VARCHAR(50) NOT NULL,
    "concern_type" VARCHAR(50) NOT NULL,
    "fix_duration" VARCHAR(50) NOT NULL,
    "currency_symbol" CHAR(5) NOT NULL,
    "price_range" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concerns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "account_code" VARCHAR(50) NOT NULL,
    "posted_date" DATE NOT NULL,
    "ref_num_1" VARCHAR(50) NOT NULL,
    "ref_num_2" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "local_dr" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "local_cr" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "local_balance" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estatesId" INTEGER,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedbacks" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "estate_id" INTEGER NOT NULL,
    "resident_id" INTEGER NOT NULL,
    "category_name" VARCHAR(255) NOT NULL,
    "subcategory" VARCHAR(100) NOT NULL,
    "concern_description" TEXT NOT NULL,
    "solution_provided" TEXT NOT NULL,
    "estimate_fix_duration" VARCHAR(100) NOT NULL,
    "call_recording" VARCHAR(255) NOT NULL,
    "call_transcription" VARCHAR(255) NOT NULL,
    "maintenance_upload" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "estate_residents" ADD CONSTRAINT "estate_residents_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concerns" ADD CONSTRAINT "concerns_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_estatesId_fkey" FOREIGN KEY ("estatesId") REFERENCES "estates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_resident_id_fkey" FOREIGN KEY ("resident_id") REFERENCES "estate_residents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
