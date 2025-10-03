import { useState } from 'react';
import { Plus } from 'lucide-react';
import * as Icons from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { App, AppCategory } from '@/types';
import { availableIcons, availableColors } from '@/data/defaultApps';
import { useToast } from '@/hooks/use-toast';

interface AddAppDialogProps {
  onAddApp: (app: App) => void;
  existingApps: App[];
}

export const AddAppDialog = ({ onAddApp, existingApps }: AddAppDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    icon: 'Smartphone',
    color: 'bg-blue-500',
    timeLimit: 30,
    category: 'entertainment' as AppCategory,
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.url.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const newApp: App = {
      id: Math.max(0, ...existingApps.map(app => app.id)) + 1,
      name: formData.name,
      url: formData.url,
      icon: formData.icon,
      color: formData.color,
      timeLimit: formData.timeLimit,
      category: formData.category,
      totalTimeUsed: 0,
    };

    onAddApp(newApp);
    toast({
      title: 'App added!',
      description: `${formData.name} has been added to your apps.`,
    });

    // Reset form
    setFormData({
      name: '',
      url: '',
      icon: 'Smartphone',
      color: 'bg-blue-500',
      timeLimit: 30,
      category: 'entertainment',
    });
    setOpen(false);
  };

  const IconComponent = Icons[formData.icon as keyof typeof Icons] as any;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full border-dashed border-2 h-auto aspect-square rounded-2xl hover:border-primary/50 hover:bg-primary/5"
        >
          <div className="flex flex-col items-center gap-2 p-6">
            <Plus className="w-12 h-12 text-muted-foreground" />
            <span className="text-sm font-medium">Add App</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New App</DialogTitle>
          <DialogDescription>
            Add apps like WhatsApp, YouTube, PUBG, or any other app you want to track.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">App Name *</Label>
            <Input
              id="name"
              placeholder="e.g., WhatsApp, YouTube, PUBG"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Website URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://www.example.com"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger id="icon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableIcons.map((icon) => {
                    const Icon = Icons[icon as keyof typeof Icons] as any;
                    return (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{icon}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => setFormData({ ...formData, color: value })}
              >
                <SelectTrigger id="color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(availableColors).map(([name, colorClass]) => (
                    <SelectItem key={name} value={colorClass}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${colorClass}`} />
                        <span>{name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
              <Input
                id="timeLimit"
                type="number"
                min="5"
                max="180"
                value={formData.timeLimit}
                onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) || 30 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: AppCategory) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
            <div className={`${formData.color} rounded-xl p-4 flex items-center gap-3 text-white`}>
              {IconComponent && <IconComponent className="w-8 h-8" />}
              <div>
                <div className="font-semibold">{formData.name || 'App Name'}</div>
                <div className="text-xs opacity-80">{formData.timeLimit} min limit</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add App
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};