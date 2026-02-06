import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Car, DollarSign, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateAuction } from '@/hooks/useAuctions';
import { useAuth } from '@/contexts/AuthContext';
import { indianBrands, fuelTypes } from '@/lib/indianCarData';

const auctionFormSchema = z.object({
  carBrand: z.string().min(1, 'Please select a brand'),
  carModel: z.string().min(1, 'Model is required').max(50, 'Model must be less than 50 characters'),
  carYear: z.coerce.number().min(1990, 'Year must be 1990 or later').max(new Date().getFullYear() + 1, 'Invalid year'),
  fuelType: z.string().min(1, 'Please select a fuel type'),
  condition: z.enum(['new', 'excellent', 'good', 'fair', 'poor'], {
    required_error: 'Please select condition',
  }),
  startingPrice: z.coerce.number().min(50000, 'Starting price must be at least ₹50,000').max(100000000, 'Price too high'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 hour').max(168, 'Duration cannot exceed 7 days'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  imageUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

type AuctionFormValues = z.infer<typeof auctionFormSchema>;

const conditions = [
  { value: 'new', label: 'New' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const durationOptions = [
  { value: 1, label: '1 Hour' },
  { value: 6, label: '6 Hours' },
  { value: 12, label: '12 Hours' },
  { value: 24, label: '1 Day' },
  { value: 48, label: '2 Days' },
  { value: 72, label: '3 Days' },
  { value: 168, label: '7 Days' },
];

interface CreateAuctionModalProps {
  onSuccess?: () => void;
}

export const CreateAuctionModal = ({ onSuccess }: CreateAuctionModalProps) => {
  const [open, setOpen] = useState(false);
  const { createAuction, loading } = useCreateAuction();
  const { user } = useAuth();

  const form = useForm<AuctionFormValues>({
    resolver: zodResolver(auctionFormSchema),
    defaultValues: {
      carBrand: '',
      carModel: '',
      carYear: new Date().getFullYear(),
      fuelType: '',
      condition: 'good',
      startingPrice: 500000,
      duration: 24,
      description: '',
      imageUrl: '',
    },
  });

  const onSubmit = async (values: AuctionFormValues) => {
    const result = await createAuction({
      carBrand: values.carBrand,
      carModel: values.carModel,
      carYear: values.carYear,
      fuelType: values.fuelType,
      condition: values.condition,
      startingPrice: values.startingPrice,
      duration: values.duration,
      description: values.description,
      imageUrl: values.imageUrl || undefined,
    });

    if (result.success) {
      form.reset();
      setOpen(false);
      onSuccess?.();
    }
  };

  const brands = indianBrands.filter((b) => b !== 'All');
  const fuels = fuelTypes.filter((f) => f !== 'All');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" disabled={!user}>
          <Plus className="w-4 h-4" />
          Create Auction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            <Car className="w-6 h-6 text-primary" />
            Create New Auction
          </DialogTitle>
          <DialogDescription>
            List your car for auction. Fill in the details below to get started.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Car Details Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Car Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="carBrand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand} value={brand}>
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="carModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Swift, Creta" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="carYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fuel Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Fuel" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fuels.map((fuel) => (
                            <SelectItem key={fuel} value={fuel}>
                              {fuel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {conditions.map((cond) => (
                            <SelectItem key={cond.value} value={cond.value}>
                              {cond.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pricing & Duration
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="500000"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value ? `₹${(field.value / 100000).toFixed(2)} Lakh` : 'Enter amount'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {durationOptions.map((dur) => (
                            <SelectItem key={dur.value} value={dur.value.toString()}>
                              {dur.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Auction ends after this time
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Additional Details
              </h3>
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/car-image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide a direct link to your car's image
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any additional details about your car..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/500 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 pt-4"
              >
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Creating...' : 'Launch Auction'}
                </Button>
              </motion.div>
            </AnimatePresence>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
