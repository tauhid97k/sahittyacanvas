<?php

namespace App\Http\Controllers;

use App\Models\EditorMedia;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class EditorMediaController extends Controller
{
    /**
     * Upload an image for the rich text editor
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:5120'], // 5MB max
            'context' => ['nullable', 'string', 'max:50'],
            'post_id' => ['nullable', 'integer', 'exists:posts,id'],
        ]);

        $postId = $request->input('post_id');

        // If post_id is provided, attach image directly to the post
        if ($postId) {
            $post = Post::withTrashed()->findOrFail($postId);
            
            $media = $post
                ->addMediaFromRequest('image')
                ->toMediaCollection('editor_images');

            return response()->json([
                'success' => true,
                'url' => $media->getUrl(),
                'mediaId' => $media->id,
                'urls' => [
                    'original' => $media->getUrl(),
                    'large' => $media->getUrl('large'),
                    'medium' => $media->getUrl('medium'),
                    'thumb' => $media->getUrl('thumb'),
                ],
            ]);
        }

        // Fallback: store in EditorMedia for new posts (will be linked later or cleaned up)
        $media = DB::transaction(function () use ($request) {
            $editorMedia = EditorMedia::create([
                'user_id' => Auth::id(),
                'context' => $request->input('context', 'general'),
            ]);

            return $editorMedia
                ->addMediaFromRequest('image')
                ->toMediaCollection('images');
        });

        return response()->json([
            'success' => true,
            'url' => $media->getUrl(),
            'mediaId' => $media->id,
            'urls' => [
                'original' => $media->getUrl(),
                'large' => $media->getUrl('large'),
                'medium' => $media->getUrl('medium'),
                'thumb' => $media->getUrl('thumb'),
            ],
        ]);
    }

    /**
     * Delete an image from the editor
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'url' => ['required', 'string'],
        ]);

        $url = $request->input('url');

        // First, try to find media attached to a Post (editor_images collection)
        $media = Media::where('model_type', Post::class)
            ->where('collection_name', 'editor_images')
            ->get()
            ->first(function ($media) use ($url) {
                return $media->getUrl() === $url ||
                       str_contains($url, $media->file_name);
            });

        if ($media) {
            // Check ownership - user must own the post
            $post = Post::withTrashed()->find($media->model_id);
            if ($post && $post->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized',
                ], 403);
            }

            $media->delete();

            return response()->json([
                'success' => true,
                'message' => 'Image deleted successfully',
            ]);
        }

        // Fallback: Find media in EditorMedia (for orphaned/legacy images)
        $media = Media::where('model_type', EditorMedia::class)
            ->get()
            ->first(function ($media) use ($url) {
                return $media->getUrl() === $url ||
                       str_contains($url, $media->file_name);
            });

        if (!$media) {
            return response()->json([
                'success' => false,
                'message' => 'Media not found',
            ], 404);
        }

        // Check ownership
        $editorMedia = EditorMedia::find($media->model_id);
        if ($editorMedia && $editorMedia->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        // Delete the media
        $media->delete();

        // Delete the EditorMedia record if it has no more media
        if ($editorMedia && $editorMedia->media()->count() === 0) {
            $editorMedia->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Image deleted successfully',
        ]);
    }
}
