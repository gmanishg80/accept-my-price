import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Job, JobSchema } from 'src/schemas/job.schema';
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { SubCategory, SubCategorySchema } from 'src/schemas/sub-category.schema';


@Module({
  imports: [MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
    { name: Job.name, schema: JobSchema },
    { name: Category.name, schema: CategorySchema },
    { name: SubCategory.name, schema: SubCategorySchema },

  ])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule { }