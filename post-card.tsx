import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Calendar, CheckCircle, Heart, Gift, Leaf, Beef, Sprout, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import RatingDisplay from "@/components/rating-display";
import { PostWithAuthor } from "@shared/schema";

interface PostCardProps {
  post: PostWithAuthor;
  onUpdate: () => void;
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const claimMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${post.id}/claim`);
    },
    onSuccess: () => {
      toast({
        title: "Post Claimed",
        description: "You have successfully claimed this post. Coordinate with the owner for pickup.",
      });
      onUpdate();
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
        description: error.message || "Failed to claim post",
        variant: "destructive",
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/posts/${post.id}/complete`);
    },
    onSuccess: () => {
      toast({
        title: "Post Completed",
        description: "The post has been marked as completed.",
      });
      onUpdate();
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
        description: error.message || "Failed to complete post",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = () => {
    switch (post.status) {
      case "active":
        return <Badge className="bg-green-500 text-white">Available</Badge>;
      case "claimed":
        return <Badge className="bg-yellow-500 text-white">Claimed</Badge>;
      case "completed":
        return <Badge className="bg-gray-500 text-white">Completed</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = () => {
    return post.type === "donation" ? (
      <Badge variant="outline" className="border-blue-500 text-blue-700">
        <Gift className="h-3 w-3 mr-1" />
        Donation
      </Badge>
    ) : (
      <Badge variant="outline" className="border-orange-500 text-orange-700">
        <Heart className="h-3 w-3 mr-1" />
        Request
      </Badge>
    );
  };

  const getDietaryBadge = () => {
    switch (post.dietaryType) {
      case "vegetarian":
        return (
          <Badge variant="outline" className="border-green-500 text-green-700">
            <Leaf className="h-3 w-3 mr-1" />
            Vegetarian
          </Badge>
        );
      case "non-vegetarian":
        return (
          <Badge variant="outline" className="border-red-500 text-red-700">
            <Beef className="h-3 w-3 mr-1" />
            Non-Veg
          </Badge>
        );
      case "vegan":
        return (
          <Badge variant="outline" className="border-green-600 text-green-800">
            <Sprout className="h-3 w-3 mr-1" />
            Vegan
          </Badge>
        );
      case "mixed":
        return (
          <Badge variant="outline" className="border-gray-500 text-gray-700">
            <Gift className="h-3 w-3 mr-1" />
            Mixed
          </Badge>
        );
      default:
        return null;
    }
  };

  const isExpiringSoon = () => {
    const now = new Date();
    const expiresAt = new Date(post.expiresAt);
    const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;
  };

  const isOwner = user?.id === post.authorId;
  const canClaim = !isOwner && post.status === "active" && user?.id !== post.claimedBy;
  const canComplete = (isOwner || user?.id === post.claimedBy) && post.status === "claimed";

  const authorRating = parseFloat(post.author.averageRating || "0");

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={post.author.profileImageUrl || ""} alt={post.author.firstName || ""} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {post.author.firstName?.[0]}{post.author.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold">
                {post.author.firstName} {post.author.lastName?.charAt(0)}.
              </h4>
              <div className="flex items-center space-x-2">
                <RatingDisplay rating={authorRating} size="sm" />
                <span className="text-xs text-muted-foreground">
                  {authorRating.toFixed(1)} • {post.author.totalDonations} donations
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            {getStatusBadge()}
            {getTypeBadge()}
            {getDietaryBadge()}
          </div>
        </div>

        {/* Image */}
        {post.imageUrl && (
          <div className="mb-4">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Content */}
        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
        <p className="text-muted-foreground mb-4">{post.description}</p>
        
        {/* Allergen Information */}
        {post.allergens && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Allergen Info:</span>
              <span className="text-sm text-yellow-700">{post.allergens}</span>
            </div>
          </div>
        )}
        
        {/* Metadata */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{post.location}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
          </div>
          {isExpiringSoon() && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="text-orange-600 font-medium">Expires soon</span>
            </div>
          )}
        </div>

        {/* Claimed Status */}
        {post.status === "claimed" && post.claimer && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm">
                Claimed by {post.claimer.firstName} {post.claimer.lastName?.charAt(0)}.
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {post.status === "active" && (
              <span>Available for pickup</span>
            )}
            {post.status === "claimed" && (
              <span>Waiting for pickup</span>
            )}
            {post.status === "completed" && (
              <span>Successfully completed</span>
            )}
            {post.status === "expired" && (
              <span>This post has expired</span>
            )}
          </div>

          <div className="flex space-x-2">
            {canClaim && (
              <Button 
                size="sm"
                onClick={() => claimMutation.mutate()}
                disabled={claimMutation.isPending}
              >
                {claimMutation.isPending ? "Claiming..." : "Claim"}
              </Button>
            )}
            
            {canComplete && (
              <Button 
                size="sm"
                variant="outline"
                onClick={() => completeMutation.mutate()}
                disabled={completeMutation.isPending}
              >
                {completeMutation.isPending ? "Completing..." : "Mark Complete"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}