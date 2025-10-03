import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { mockDatabase } from '@/lib/mockData';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Admin = () => {
  const [logos] = useState(mockDatabase.logos);
  const [taglines] = useState(mockDatabase.taglines);
  const [audios] = useState(mockDatabase.audios);
  const [images] = useState(mockDatabase.images);
  const [texts] = useState(mockDatabase.texts);

  const handleAddItem = (type: string) => {
    toast.success(`New ${type} entry form would open here`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage copyright database entries
          </p>
        </div>

        <Tabs defaultValue="logos" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
            <TabsTrigger value="logos">Logos</TabsTrigger>
            <TabsTrigger value="taglines">Taglines</TabsTrigger>
            <TabsTrigger value="audios">Audio</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="texts">Texts</TabsTrigger>
          </TabsList>

          <TabsContent value="logos" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registered Logos</CardTitle>
                    <CardDescription>
                      Manage copyrighted logo database
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleAddItem('logo')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Logo
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {logos.map((logo) => (
                    <div
                      key={logo.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{logo.name}</p>
                        <p className="text-sm text-muted-foreground">{logo.file}</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="taglines" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registered Taglines</CardTitle>
                    <CardDescription>
                      Manage copyrighted tagline database
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleAddItem('tagline')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Tagline
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {taglines.map((tagline) => (
                    <div
                      key={tagline.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <p className="font-medium">{tagline.text}</p>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audios" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registered Audio</CardTitle>
                    <CardDescription>
                      Manage copyrighted audio database
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleAddItem('audio')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Audio
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {audios.map((audio) => (
                    <div
                      key={audio.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{audio.name}</p>
                        <p className="text-sm text-muted-foreground">{audio.file}</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registered Images</CardTitle>
                    <CardDescription>
                      Manage copyrighted image/meme database
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleAddItem('image')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Image
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{image.name}</p>
                        <p className="text-sm text-muted-foreground">{image.file}</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="texts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Registered Texts</CardTitle>
                    <CardDescription>
                      Manage copyrighted text database
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleAddItem('text')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Text
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {texts.map((text) => (
                    <div
                      key={text.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <p className="font-medium">{text.content}</p>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
