-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_houseId_fkey";

-- DropForeignKey
ALTER TABLE "Complaint" DROP CONSTRAINT "Complaint_houseId_fkey";

-- DropForeignKey
ALTER TABLE "House" DROP CONSTRAINT "House_streetId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_houseId_fkey";

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_streetId_fkey" FOREIGN KEY ("streetId") REFERENCES "Street"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;
