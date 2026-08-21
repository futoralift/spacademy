import { apiRequest, createFormData } from "./http";
import type {
  AnnouncementResponse,
  AnnouncementUpdateUploadRequest,
  AnnouncementUploadRequest,
  BlogTaxonomyResponse,
  CategoryCreateRequest,
  CategoryResponse,
  LearningHubVideoResponse,
  LearningHubVideoUpdateUploadRequest,
  LearningHubVideoUploadRequest,
  MediaAssetResponse,
  MediaAssetUpdateUploadRequest,
  MediaAssetUploadRequest,
  MediaType,
  PaginationAnnouncementResponse,
  PaginationLearningHubVideoResponse,
  PaginationMediaAssetResponse,
  PaginationParams,
  PaginationPostResponse,
  PostCreateUploadRequest,
  PostResponse,
  PostUpdateUploadRequest,
  SiteSettingsResponse,
  SiteSettingsUpdateRequest,
  TagCreateRequest,
  TagResponse,
} from "./types";

interface RequestOptions {
  signal?: AbortSignal;
}

export async function getPosts(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationPostResponse> {
  return apiRequest<PaginationPostResponse>("/post/", {
    query: params,
    signal: options?.signal,
  }, true);
}

export async function createPost(
  payload: PostCreateUploadRequest,
  options?: RequestOptions,
): Promise<PostResponse> {
  return apiRequest<PostResponse>("/post/", {
    method: "POST",
    body: createFormData({
      title: payload.title,
      content: payload.content,
      excerpt: payload.excerpt,
      tag_ids: payload.tagIds,
      category_ids: payload.categoryIds,
      meta_title: payload.metaTitle,
      meta_description: payload.metaDescription,
      featured_image: payload.featuredImage,
    }),
    signal: options?.signal,
  }, true);
}

export async function updatePost(
  payload: PostUpdateUploadRequest,
  options?: RequestOptions,
): Promise<PostResponse> {
  return apiRequest<PostResponse>("/post/", {
    method: "PUT",
    body: createFormData({
      post_id: payload.id,
      title: payload.title,
      slug: payload.slug,
      content: payload.content,
      status: payload.status,
      excerpt: payload.excerpt,
      tag_ids: payload.tagIds,
      category_ids: payload.categoryIds,
      meta_title: payload.metaTitle,
      meta_description: payload.metaDescription,
      featured_image: payload.featuredImage,
    }),
    signal: options?.signal,
  }, true);
}

export async function deletePost(
  postId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/post/", {
    method: "DELETE",
    query: { post_id: postId },
    signal: options?.signal,
  }, true);
}

export async function getBlogTaxonomies(
  options?: RequestOptions,
): Promise<BlogTaxonomyResponse> {
  return apiRequest<BlogTaxonomyResponse>("/blog-taxonomy/", {
    signal: options?.signal,
  }, true);
}

export async function createTag(
  payload: TagCreateRequest,
  options?: RequestOptions,
): Promise<TagResponse> {
  return apiRequest<TagResponse>("/blog-taxonomy/tag", {
    method: "POST",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function createCategory(
  payload: CategoryCreateRequest,
  options?: RequestOptions,
): Promise<CategoryResponse> {
  return apiRequest<CategoryResponse>("/blog-taxonomy/category", {
    method: "POST",
    body: payload,
    signal: options?.signal,
  }, true);
}

export async function deleteTag(
  tagId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/blog-taxonomy/tag", {
    method: "DELETE",
    query: { tag_id: tagId },
    signal: options?.signal,
  }, true);
}

export async function deleteCategory(
  categoryId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/blog-taxonomy/category", {
    method: "DELETE",
    query: { category_id: categoryId },
    signal: options?.signal,
  }, true);
}

export async function getPublicLearningHubVideos(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationLearningHubVideoResponse> {
  return apiRequest<PaginationLearningHubVideoResponse>("/learning_hub/videos/public", {
    query: params,
    signal: options?.signal,
  });
}

export async function getLearningHubVideos(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationLearningHubVideoResponse> {
  return apiRequest<PaginationLearningHubVideoResponse>("/learning_hub/videos/", {
    query: params,
    signal: options?.signal,
  });
}

export async function createLearningHubVideo(
  payload: LearningHubVideoUploadRequest,
  options?: RequestOptions,
): Promise<LearningHubVideoResponse> {
  return apiRequest<LearningHubVideoResponse>("/learning_hub/videos/", {
    method: "POST",
    body: createFormData({
      title: payload.title,
      youtube_link: payload.youtubeLink,
      video_type: payload.videoType,
      publish_date: payload.publishDate,
      thumbnail: payload.thumbnail,
    }),
    signal: options?.signal,
  });
}

export async function updateLearningHubVideo(
  payload: LearningHubVideoUpdateUploadRequest,
  options?: RequestOptions,
): Promise<LearningHubVideoResponse> {
  return apiRequest<LearningHubVideoResponse>("/learning_hub/videos/", {
    method: "PUT",
    body: createFormData({
      video_id: payload.id,
      title: payload.title,
      youtube_link: payload.youtubeLink,
      video_type: payload.videoType,
      publish_date: payload.publishDate,
      thumbnail: payload.thumbnail,
    }),
    signal: options?.signal,
  });
}

export async function deleteLearningHubVideo(
  videoId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/learning_hub/videos/", {
    method: "DELETE",
    query: { video_id: videoId },
    signal: options?.signal,
  });
}

export async function getPublicAnnouncements(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationAnnouncementResponse> {
  return apiRequest<PaginationAnnouncementResponse>("/announcements/public", {
    query: params,
    signal: options?.signal,
  });
}

export async function getAnnouncements(
  params: PaginationParams = {},
  options?: RequestOptions,
): Promise<PaginationAnnouncementResponse> {
  return apiRequest<PaginationAnnouncementResponse>("/announcements/", {
    query: params,
    signal: options?.signal,
  });
}

export async function createAnnouncement(
  payload: AnnouncementUploadRequest,
  options?: RequestOptions,
): Promise<AnnouncementResponse> {
  return apiRequest<AnnouncementResponse>("/announcements/", {
    method: "POST",
    body: createFormData({
      title: payload.title,
      start_date: payload.startDate,
      end_date: payload.endDate,
      status: payload.status,
      banner_image: payload.bannerImage,
    }),
    signal: options?.signal,
  });
}

export async function updateAnnouncement(
  payload: AnnouncementUpdateUploadRequest,
  options?: RequestOptions,
): Promise<AnnouncementResponse> {
  return apiRequest<AnnouncementResponse>("/announcements/", {
    method: "PUT",
    body: createFormData({
      announcement_id: payload.id,
      title: payload.title,
      start_date: payload.startDate,
      end_date: payload.endDate,
      status: payload.status,
      banner_image: payload.bannerImage,
    }),
    signal: options?.signal,
  });
}

export async function deleteAnnouncement(
  announcementId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/announcements/", {
    method: "DELETE",
    query: { announcement_id: announcementId },
    signal: options?.signal,
  });
}

export async function getMediaAssets(
  params: PaginationParams & { mediaType?: MediaType } = {},
  options?: RequestOptions,
): Promise<PaginationMediaAssetResponse> {
  return apiRequest<PaginationMediaAssetResponse>("/media_library/", {
    query: {
      limit: params.limit,
      offset: params.offset,
      media_type: params.mediaType,
    },
    signal: options?.signal,
  });
}

export async function createMediaAsset(
  payload: MediaAssetUploadRequest,
  options?: RequestOptions,
): Promise<MediaAssetResponse> {
  return apiRequest<MediaAssetResponse>("/media_library/", {
    method: "POST",
    body: createFormData({
      title: payload.title,
      media_type: payload.mediaType,
      file: payload.file,
    }),
    signal: options?.signal,
  });
}

export async function updateMediaAsset(
  payload: MediaAssetUpdateUploadRequest,
  options?: RequestOptions,
): Promise<MediaAssetResponse> {
  return apiRequest<MediaAssetResponse>("/media_library/", {
    method: "PUT",
    body: createFormData({
      asset_id: payload.id,
      title: payload.title,
      media_type: payload.mediaType,
      file: payload.file,
    }),
    signal: options?.signal,
  });
}

export async function deleteMediaAsset(
  assetId: string,
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/media_library/", {
    method: "DELETE",
    query: { asset_id: assetId },
    signal: options?.signal,
  });
}

export async function syncMediaAssets(
  options?: RequestOptions,
): Promise<number> {
  return apiRequest<number>("/media_library/sync", {
    method: "POST",
    signal: options?.signal,
  });
}

export async function getSiteSettings(
  options?: RequestOptions,
): Promise<SiteSettingsResponse> {
  return apiRequest<SiteSettingsResponse>("/settings/", {
    signal: options?.signal,
  });
}

export async function updateSiteSettings(
  payload: SiteSettingsUpdateRequest,
  options?: RequestOptions,
): Promise<SiteSettingsResponse> {
  return apiRequest<SiteSettingsResponse>("/settings/", {
    method: "PUT",
    body: payload,
    signal: options?.signal,
  });
}
