import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Gift, HandHeart, X, Camera, Leaf, Beef, Sprout } from "lucide-react";

const postSchema = z.object({
  type: z.enum(["donation", "request"]),
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().min(1, "Description is required"),
  quantity: z.string().min(1, "Quantity is required"),
  location: z.string().min(1, "Location is required"),
  expiresAt: z.string().min(1, "Expiry date is required"),
  dietaryType: z.enum(["vegetarian", "non-vegetarian", "vegan", "mixed"]).default("mixed"),
  allergens: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

interface PostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: "donation" | "request" | null;
  onSuccess: () => void;
}

export default function PostFormModal({ isOpen, onClose, defaultType, onSuccess }: PostFormModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      type: defaultType || "donation",
      title: "",
      description: "",
      quantity: "",
      location: "",
      expiresAt: "",
      dietaryType: "mixed",
      allergens: "",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: PostFormData) => {
      // Convert expiresAt to ISO string
      const expiresAt = new Date(data.expiresAt).toISOString();
      
      const postData = {
        ...data,
        expiresAt,
        imageUrl: imagePreview, // In a real app, you'd upload the image to storage first
      };
      
      await apiRequest("POST", "/api/posts", postData);
    },
    onSuccess: () => {
      toast({
        title: "Post Created",
        description: "Your post has been created successfully!",
      });
      form.reset();
      setImageFile(null);
      setImagePreview(null);
      onSuccess();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (data: PostFormData) => {
    createPostMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    setImageFile(null);
    setImagePreview(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-dark-custom">Create New Post</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Post Type Selection */}
          <div>
            <Label className="text-sm font-medium text-dark-custom mb-3 block">Post Type</Label>
            <RadioGroup
              value={form.watch("type")}
              onValueChange={(value) => form.setValue("type", value as "donation" | "request")}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="donation" id="donation" />
                <Label 
                  htmlFor="donation" 
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-custom transition-colors flex-1"
                >
                  <Gift className="text-secondary-custom text-xl mr-3" />
                  <div>
                    <div className="font-medium text-dark-custom">Donate Food</div>
                    <div className="text-sm text-medium-custom">Share surplus food</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="request" id="request" />
                <Label 
                  htmlFor="request" 
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-custom transition-colors flex-1"
                >
                  <HandHeart className="text-accent-custom text-xl mr-3" />
                  <div>
                    <div className="font-medium text-dark-custom">Request Food</div>
                    <div className="text-sm text-medium-custom">Ask for help</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Food Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-dark-custom mb-2 block">
                Food Title
              </Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="e.g., Homemade Lasagna"
                className="w-full"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-error-custom mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="quantity" className="text-sm font-medium text-dark-custom mb-2 block">
                Quantity/Serves
              </Label>
              <Input
                id="quantity"
                {...form.register("quantity")}
                placeholder="e.g., Feeds 4-6 people"
                className="w-full"
              />
              {form.formState.errors.quantity && (
                <p className="text-sm text-error-custom mt-1">{form.formState.errors.quantity.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-dark-custom mb-2 block">
              Description
            </Label>
            <Textarea
              id="description"
              {...form.register("description")}
              rows={4}
              placeholder="Describe the food, ingredients, pickup instructions, etc."
              className="w-full"
            />
            {form.formState.errors.description && (
              <p className="text-sm text-error-custom mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Location and Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location" className="text-sm font-medium text-dark-custom mb-2 block">
                Pickup Location
              </Label>
              <Input
                id="location"
                {...form.register("location")}
                placeholder="Street address or area"
                className="w-full"
              />
              {form.formState.errors.location && (
                <p className="text-sm text-error-custom mt-1">{form.formState.errors.location.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="expiresAt" className="text-sm font-medium text-dark-custom mb-2 block">
                Available Until
              </Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                {...form.register("expiresAt")}
                className="w-full"
              />
              {form.formState.errors.expiresAt && (
                <p className="text-sm text-error-custom mt-1">{form.formState.errors.expiresAt.message}</p>
              )}
            </div>
          </div>

          {/* Dietary Information */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">Dietary Type</Label>
              <Select
                value={form.watch("dietaryType")}
                onValueChange={(value) => form.setValue("dietaryType", value as any)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select dietary type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetarian">
                    <div className="flex items-center">
                      <Leaf className="h-4 w-4 mr-2 text-green-600" />
                      Vegetarian
                    </div>
                  </SelectItem>
                  <SelectItem value="non-vegetarian">
                    <div className="flex items-center">
                      <Beef className="h-4 w-4 mr-2 text-red-600" />
                      Non-Vegetarian
                    </div>
                  </SelectItem>
                  <SelectItem value="vegan">
                    <div className="flex items-center">
                      <Sprout className="h-4 w-4 mr-2 text-green-700" />
                      Vegan
                    </div>
                  </SelectItem>
                  <SelectItem value="mixed">
                    <div className="flex items-center">
                      <Gift className="h-4 w-4 mr-2 text-blue-600" />
                      Mixed/Other
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="allergens" className="text-sm font-medium mb-2 block">
                Allergen Information (Optional)
              </Label>
              <Input
                id="allergens"
                {...form.register("allergens")}
                placeholder="e.g., Contains nuts, dairy, gluten"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Help others with dietary restrictions by listing common allergens
              </p>
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <Label className="text-sm font-medium text-dark-custom mb-2 block">
              Add Photo (Optional)
            </Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-custom transition-colors">
              {imagePreview ? (
                <div className="space-y-4">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <>
                  <Camera className="h-12 w-12 text-medium-custom mx-auto mb-4" />
                  <p className="text-medium-custom mb-2">Click to upload or drag and drop</p>
                  <p className="text-sm text-medium-custom">PNG, JPG up to 5MB</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" className="mt-2">
                      Choose File
                    </Button>
                  </Label>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createPostMutation.isPending}
              className="flex-1 bg-primary-custom hover:bg-primary-custom/90"
            >
              {createPostMutation.isPending ? "Creating..." : "Post to Community"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
