import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as contentApi from "./content";
import { invalidateMany } from "./hookUtils";
import { queryKeys } from "./queryKeys";
import type { MediaType, PaginationParams } from "./types";

export function usePostsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.posts.list(params),
    queryFn: ({ signal }) => contentApi.getPosts(params, { signal }),
  });
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof contentApi.createPost>[0]) =>
      contentApi.createPost(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useUpdatePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof contentApi.updatePost>[0]) =>
      contentApi.updatePost(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => contentApi.deletePost(postId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useBlogTaxonomiesQuery() {
  return useQuery({
    queryKey: queryKeys.blogTaxonomy.detail(),
    queryFn: ({ signal }) => contentApi.getBlogTaxonomies({ signal }),
  });
}

export function useCreateTagMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof contentApi.createTag>[0]) =>
      contentApi.createTag(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.blogTaxonomy.all });
    },
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof contentApi.createCategory>[0]) =>
      contentApi.createCategory(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.blogTaxonomy.all });
    },
  });
}

export function useDeleteTagMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tagId: string) => contentApi.deleteTag(tagId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.blogTaxonomy.all });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => contentApi.deleteCategory(categoryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.blogTaxonomy.all });
    },
  });
}

export function usePublicLearningHubVideosQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.learningHub.publicList(params),
    queryFn: ({ signal }) => contentApi.getPublicLearningHubVideos(params, { signal }),
  });
}

export function useLearningHubVideosQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.learningHub.adminList(params),
    queryFn: ({ signal }) => contentApi.getLearningHubVideos(params, { signal }),
  });
}

export function useCreateLearningHubVideoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof contentApi.createLearningHubVideo>[0]) =>
      contentApi.createLearningHubVideo(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.learningHub.all });
    },
  });
}

export function useUpdateLearningHubVideoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof contentApi.updateLearningHubVideo>[0]) =>
      contentApi.updateLearningHubVideo(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.learningHub.all });
    },
  });
}

export function useDeleteLearningHubVideoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (videoId: string) => contentApi.deleteLearningHubVideo(videoId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.learningHub.all });
    },
  });
}

export function usePublicAnnouncementsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.announcements.publicList(params),
    queryFn: ({ signal }) => contentApi.getPublicAnnouncements(params, { signal }),
  });
}

export function useAnnouncementsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.announcements.adminList(params),
    queryFn: ({ signal }) => contentApi.getAnnouncements(params, { signal }),
  });
}

export function useCreateAnnouncementMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof contentApi.createAnnouncement>[0]) =>
      contentApi.createAnnouncement(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
    },
  });
}

export function useUpdateAnnouncementMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof contentApi.updateAnnouncement>[0]) =>
      contentApi.updateAnnouncement(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
    },
  });
}

export function useDeleteAnnouncementMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (announcementId: string) => contentApi.deleteAnnouncement(announcementId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
    },
  });
}

export function useMediaAssetsQuery(
  params: PaginationParams & { mediaType?: MediaType } = {},
) {
  return useQuery({
    queryKey: queryKeys.mediaLibrary.list(params),
    queryFn: ({ signal }) => contentApi.getMediaAssets(params, { signal }),
  });
}

export function useCreateMediaAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof contentApi.createMediaAsset>[0]) =>
      contentApi.createMediaAsset(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.mediaLibrary.all });
    },
  });
}

export function useUpdateMediaAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof contentApi.updateMediaAsset>[0]) =>
      contentApi.updateMediaAsset(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.mediaLibrary.all });
    },
  });
}

export function useDeleteMediaAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assetId: string) => contentApi.deleteMediaAsset(assetId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.mediaLibrary.all });
    },
  });
}

export function useSyncMediaAssetsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => contentApi.syncMediaAssets(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.mediaLibrary.all });
    },
  });
}

export function useSiteSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: ({ signal }) => contentApi.getSiteSettings({ signal }),
  });
}

export function useUpdateSiteSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof contentApi.updateSiteSettings>[0]) =>
      contentApi.updateSiteSettings(payload),
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.settings.all,
        queryKeys.announcements.all,
      ]);
    },
  });
}
