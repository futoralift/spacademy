import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as contentApi from "./content";
import { invalidateMany } from "./hookUtils";
import { queryKeys } from "./queryKeys";
import { mockStore, paginate, uuid, now } from "./mockStore";
import type { MediaType, PaginationParams } from "./types";

// ─── Posts / Blog ─────────────────────────────────────────────────────────────

export function usePostsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.posts.list(params),
    queryFn: async ({ signal }) => {
      try { return await contentApi.getPosts(params, { signal }); }
      catch { return paginate([]); }
    },
  });
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof contentApi.createPost>[0]) => {
      try {
        return await contentApi.createPost(payload);
      } catch {
        return {
          id: uuid(),
          title: payload.title,
          content: payload.content,
          excerpt: payload.excerpt ?? null,
          featuredImage: payload.featuredImage instanceof File ? URL.createObjectURL(payload.featuredImage) : null,
          tagIds: payload.tagIds,
          categoryIds: payload.categoryIds,
          metaTitle: payload.metaTitle ?? null,
          metaDescription: payload.metaDescription ?? null,
          slug: payload.title.toLowerCase().replace(/\s+/g, "-"),
          status: "draft" as const,
          createdAt: now(),
          updatedAt: now(),
          publishedAt: null,
          tags: [],
          categories: [],
        };
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useUpdatePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof contentApi.updatePost>[0]) => {
      try {
        return await contentApi.updatePost(payload);
      } catch {
        return {
          id: payload.id,
          title: payload.title,
          content: payload.content,
          excerpt: payload.excerpt ?? null,
          featuredImage: payload.featuredImage instanceof File ? URL.createObjectURL(payload.featuredImage) : null,
          tagIds: payload.tagIds,
          categoryIds: payload.categoryIds,
          metaTitle: payload.metaTitle ?? null,
          metaDescription: payload.metaDescription ?? null,
          slug: payload.slug,
          status: payload.status,
          createdAt: now(),
          updatedAt: now(),
          publishedAt: null,
          tags: [],
          categories: [],
        };
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

export function useDeletePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      try { return await contentApi.deletePost(postId); }
      catch { return 204 as number; }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
    },
  });
}

// ─── Blog Taxonomies ──────────────────────────────────────────────────────────

export function useBlogTaxonomiesQuery() {
  return useQuery({
    queryKey: queryKeys.blogTaxonomy.detail(),
    queryFn: async ({ signal }) => {
      try { return await contentApi.getBlogTaxonomies({ signal }); }
      catch { return { tags: [], categories: [] }; }
    },
  });
}

export function useCreateTagMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof contentApi.createTag>[0]) => {
      try { return await contentApi.createTag(payload); }
      catch { return { id: uuid(), name: payload.name, slug: payload.name.toLowerCase().replace(/\s+/g, "-") }; }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.blogTaxonomy.all });
    },
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof contentApi.createCategory>[0]) => {
      try { return await contentApi.createCategory(payload); }
      catch { return { id: uuid(), name: payload.name, slug: payload.name.toLowerCase().replace(/\s+/g, "-") }; }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.blogTaxonomy.all });
    },
  });
}

export function useDeleteTagMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tagId: string) => {
      try { return await contentApi.deleteTag(tagId); }
      catch { return 204 as number; }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.blogTaxonomy.all });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryId: string) => {
      try { return await contentApi.deleteCategory(categoryId); }
      catch { return 204 as number; }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.blogTaxonomy.all });
    },
  });
}

// ─── Learning Hub ────────────────────────────────────────────────────────────

export function usePublicLearningHubVideosQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.learningHub.publicList(params),
    queryFn: async ({ signal }) => {
      try { return await contentApi.getPublicLearningHubVideos(params, { signal }); }
      catch { return paginate(mockStore.learningHubVideos); }
    },
  });
}

export function useLearningHubVideosQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.learningHub.adminList(params),
    queryFn: async ({ signal }) => {
      try { return await contentApi.getLearningHubVideos(params, { signal }); }
      catch { return paginate(mockStore.learningHubVideos); }
    },
  });
}

export function useCreateLearningHubVideoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof contentApi.createLearningHubVideo>[0]) => {
      try {
        return await contentApi.createLearningHubVideo(payload);
      } catch {
        const item = {
          id: uuid(),
          title: payload.title,
          youtubeLink: payload.youtubeLink,
          youtubeVideoId: payload.youtubeLink.split("v=").pop() ?? "",
          videoType: payload.videoType,
          publishDate: payload.publishDate,
          subjectId: payload.subjectId ?? null,
          thumbnail: null,
          createdAt: now(),
          updatedAt: now(),
        };
        mockStore.learningHubVideos.push(item);
        return item;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.learningHub.all });
    },
  });
}

export function useUpdateLearningHubVideoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof contentApi.updateLearningHubVideo>[0]) => {
      try {
        return await contentApi.updateLearningHubVideo(payload);
      } catch {
        const idx = mockStore.learningHubVideos.findIndex((v) => v.id === payload.id);
        if (idx !== -1) mockStore.learningHubVideos[idx] = { ...mockStore.learningHubVideos[idx], ...payload } as any;
        return mockStore.learningHubVideos.find((v) => v.id === payload.id)!;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.learningHub.all });
    },
  });
}

export function useDeleteLearningHubVideoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (videoId: string) => {
      try { return await contentApi.deleteLearningHubVideo(videoId); }
      catch {
        const idx = mockStore.learningHubVideos.findIndex((v) => v.id === videoId);
        if (idx !== -1) mockStore.learningHubVideos.splice(idx, 1);
        return 204 as number;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.learningHub.all });
    },
  });
}

// ─── Announcements ───────────────────────────────────────────────────────────

export function usePublicAnnouncementsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.announcements.publicList(params),
    queryFn: async ({ signal }) => {
      try { return await contentApi.getPublicAnnouncements(params, { signal }); }
      catch { return paginate(mockStore.announcements.filter((a) => a.type === "public")); }
    },
  });
}

export function useAnnouncementsQuery(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.announcements.adminList(params),
    queryFn: async ({ signal }) => {
      try { return await contentApi.getAnnouncements(params, { signal }); }
      catch { return paginate(mockStore.announcements); }
    },
  });
}

export function useCreateAnnouncementMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof contentApi.createAnnouncement>[0]) => {
      try {
        return await contentApi.createAnnouncement(payload);
      } catch {
        const item = {
          id: uuid(),
          title: payload.title,
          description: payload.description ?? null,
          startDate: payload.startDate,
          endDate: payload.endDate,
          status: payload.status,
          type: payload.type,
          bannerImage: payload.bannerImage instanceof File ? URL.createObjectURL(payload.bannerImage) : "",
          createdAt: now(),
          updatedAt: now(),
        };
        mockStore.announcements.push(item);
        return item;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
    },
  });
}

export function useUpdateAnnouncementMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof contentApi.updateAnnouncement>[0]) => {
      try {
        return await contentApi.updateAnnouncement(payload);
      } catch {
        const idx = mockStore.announcements.findIndex((a) => a.id === payload.id);
        if (idx !== -1) mockStore.announcements[idx] = { ...mockStore.announcements[idx], ...payload } as any;
        return mockStore.announcements.find((a) => a.id === payload.id)!;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
    },
  });
}

export function useDeleteAnnouncementMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (announcementId: string) => {
      try { return await contentApi.deleteAnnouncement(announcementId); }
      catch {
        const idx = mockStore.announcements.findIndex((a) => a.id === announcementId);
        if (idx !== -1) mockStore.announcements.splice(idx, 1);
        return 204 as number;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.announcements.all });
    },
  });
}

// ─── Media Assets ────────────────────────────────────────────────────────────

export function useMediaAssetsQuery(
  params: PaginationParams & { mediaType?: MediaType } = {},
) {
  return useQuery({
    queryKey: queryKeys.mediaLibrary.list(params),
    queryFn: async ({ signal }) => {
      try { return await contentApi.getMediaAssets(params, { signal }); }
      catch { return paginate(mockStore.mediaAssets); }
    },
  });
}

export function useCreateMediaAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof contentApi.createMediaAsset>[0]) => {
      try {
        return await contentApi.createMediaAsset(payload);
      } catch {
        const item = {
          id: uuid(),
          title: payload.title,
          mediaType: payload.mediaType,
          originalFilename: payload.file.name,
          filePath: URL.createObjectURL(payload.file),
          contentType: payload.file.type,
          createdAt: now(),
          updatedAt: now(),
        };
        mockStore.mediaAssets.push(item);
        return item;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.mediaLibrary.all });
    },
  });
}

export function useUpdateMediaAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof contentApi.updateMediaAsset>[0]) => {
      try {
        return await contentApi.updateMediaAsset(payload);
      } catch {
        const idx = mockStore.mediaAssets.findIndex((m) => m.id === payload.id);
        if (idx !== -1) mockStore.mediaAssets[idx] = { ...mockStore.mediaAssets[idx], ...payload };
        return mockStore.mediaAssets.find((m) => m.id === payload.id)!;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.mediaLibrary.all });
    },
  });
}

export function useDeleteMediaAssetMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assetId: string) => {
      try { return await contentApi.deleteMediaAsset(assetId); }
      catch {
        const idx = mockStore.mediaAssets.findIndex((m) => m.id === assetId);
        if (idx !== -1) mockStore.mediaAssets.splice(idx, 1);
        return 204 as number;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.mediaLibrary.all });
    },
  });
}

export function useSyncMediaAssetsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try { return await contentApi.syncMediaAssets(); }
      catch { return null; }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.mediaLibrary.all });
    },
  });
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export function useSiteSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings.detail(),
    queryFn: async ({ signal }) => {
      try { return await contentApi.getSiteSettings({ signal }); }
      catch {
        return {
          id: "settings1",
          academyName: "The Champions Academy",
          tagline: "Excellence in Education",
          contactDetails: "Contact us for admissions",
          phoneNumbers: ["+91 98765 43210"],
          email: "contact@thechampionsacademy.com",
          address: "123 Education Street, Knowledge City, India",
          workingHours: "Mon–Sat: 9 AM – 6 PM",
          instagram: null,
          facebook: null,
          twitter: null,
          youtube: null,
          latitude: null,
          longitude: null,
          createdAt: now(),
          updatedAt: now(),
        };
      }
    },
  });
}

export function useUpdateSiteSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Parameters<typeof contentApi.updateSiteSettings>[0]) => {
      try { return await contentApi.updateSiteSettings(payload); }
      catch { return { id: "settings1", createdAt: now(), updatedAt: now(), ...payload }; }
    },
    onSuccess: async () => {
      await invalidateMany(queryClient, [
        queryKeys.settings.all,
        queryKeys.announcements.all,
      ]);
    },
  });
}
