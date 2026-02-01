export enum FileNameEnum {
    JobAreaOfProblemsFront = "job_area_of_problems_front",
    JobAreaOfProblemsBack = "job_area_of_problems_back",
    License = "license",
    Certificate = "certificate",
    HomeworkActivityImages = "homework_activity_images",
    HomeworkCategoryImage = "homework_category_image",
    IdentityDocument = "identity_document",
    ProfilePicture = "profile_picture",
    SkillLogo = "skill_logo",
    AddOnThumbnail = "add_on_thumbnail",
    InsuranceDocument = "insurance_document",
    PromotionBanner = "promotion_banner",
    StudioLogo = "studio_logo",
}

export enum UploadDirectoryEnum {
    JobDocuments = "job_documents",
    License = "licenses",
    Certificate = "certificates",
    HomeworkActivityImages = "homework_activity_images",
    HomeworkCategoryImages = "homework_category_images",
    IdentityDocument = "identity_documents",
    ProfilePicture = "profile_pictures",
    SkillLogo = "skill_logos",
    AddOnThumbnail = "add_on_thumbnails",
    InsuranceDocument = "insurance_documents",
    PromotionBanner = "promotion_banners",
    StudioLogo = "studio_logos",
}

export type RequestUploadData = {
    directory: UploadDirectoryEnum
    file_name: string
}
export type RequestUpload = {
    [key in FileNameEnum]?: Array<RequestUploadData>
}
