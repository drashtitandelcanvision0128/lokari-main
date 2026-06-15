-- RenameTable
ALTER TABLE "User" RENAME TO "users";

-- RenameIndex
ALTER INDEX "User_pkey" RENAME TO "users_pkey";
ALTER INDEX "User_email_key" RENAME TO "users_email_key";
ALTER INDEX "User_phone_key" RENAME TO "users_phone_key";

-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_bidder_id_fkey";
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_user_id_fkey";
ALTER TABLE "UserProfile" DROP CONSTRAINT "UserProfile_user_id_fkey";
ALTER TABLE "Address" DROP CONSTRAINT "Address_user_id_fkey";

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_bidder_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Address" ADD CONSTRAINT "Address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
