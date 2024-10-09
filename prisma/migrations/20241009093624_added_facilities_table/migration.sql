-- CreateTable
CREATE TABLE "facilities" (
    "id" SERIAL NOT NULL,
    "estate_id" INTEGER NOT NULL,
    "facility_name" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_estate_id_fkey" FOREIGN KEY ("estate_id") REFERENCES "estates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
