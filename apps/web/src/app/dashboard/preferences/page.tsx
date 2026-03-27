'use client'

import React, { useState, useEffect } from 'react';
import {
    Monitor, Moon, Sun, Volume2, VolumeX, Globe, Smartphone,
    Download, ArrowLeft, Save, RotateCcw, BookOpen, Clock,
    Target, Palette, Settings, Trash2, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest } from '@/lib/api/client';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AppearancePrefs {
    theme: string;
    colorScheme: string;
    fontSize: number;
    compactMode: boolean;
    animations: boolean;
}

interface LearningPrefs {
    language: string;
    autoplay: boolean;
    showSubtitles: boolean;
    playbackSpeed: number;
    difficultyLevel: string;
    studyReminders: boolean;
    dailyGoal: number;
    preferredStudyTime: string;
}

interface AudioPrefs {
    masterVolume: number;
    soundEffects: boolean;
    backgroundMusic: boolean;
    voiceNarration: boolean;
    keyboardSounds: boolean;
}

interface AccessibilityPrefs {
    highContrast: boolean;
    largeText: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
}

interface DataPrefs {
    autoDownload: boolean;
    downloadQuality: string;
    dataSaver: boolean;
    offlineMode: boolean;
    syncAcrossDevices: boolean;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_APPEARANCE: AppearancePrefs = {
    theme: 'system', colorScheme: 'green', fontSize: 16,
    compactMode: false, animations: true,
};
const DEFAULT_LEARNING: LearningPrefs = {
    language: 'english', autoplay: true, showSubtitles: true,
    playbackSpeed: 1.0, difficultyLevel: 'adaptive', studyReminders: true,
    dailyGoal: 60, preferredStudyTime: 'afternoon',
};
const DEFAULT_AUDIO: AudioPrefs = {
    masterVolume: 80, soundEffects: true, backgroundMusic: false,
    voiceNarration: true, keyboardSounds: true,
};
const DEFAULT_ACCESSIBILITY: AccessibilityPrefs = {
    highContrast: false, largeText: false, reduceMotion: false,
    screenReader: false, keyboardNavigation: true,
};
const DEFAULT_DATA: DataPrefs = {
    autoDownload: true, downloadQuality: 'medium', dataSaver: false,
    offlineMode: true, syncAcrossDevices: true,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function PreferencesPage() {
    const [fetchLoading, setFetchLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const [appearance, setAppearance] = useState<AppearancePrefs>(DEFAULT_APPEARANCE);
    const [learning, setLearning] = useState<LearningPrefs>(DEFAULT_LEARNING);
    const [audio, setAudio] = useState<AudioPrefs>(DEFAULT_AUDIO);
    const [accessibility, setAccessibility] = useState<AccessibilityPrefs>(DEFAULT_ACCESSIBILITY);
    const [data, setData] = useState<DataPrefs>(DEFAULT_DATA);

    // Load saved preferences on mount
    useEffect(() => {
        apiRequest<{ prefs: Record<string, unknown> }>('/auth/preferences')
            .then(({ prefs }) => {
                if (prefs.appearance) setAppearance({ ...DEFAULT_APPEARANCE, ...(prefs.appearance as Partial<AppearancePrefs>) });
                if (prefs.learning) setLearning({ ...DEFAULT_LEARNING, ...(prefs.learning as Partial<LearningPrefs>) });
                if (prefs.audio) setAudio({ ...DEFAULT_AUDIO, ...(prefs.audio as Partial<AudioPrefs>) });
                if (prefs.accessibility) setAccessibility({ ...DEFAULT_ACCESSIBILITY, ...(prefs.accessibility as Partial<AccessibilityPrefs>) });
                if (prefs.data) setData({ ...DEFAULT_DATA, ...(prefs.data as Partial<DataPrefs>) });
            })
            .catch(() => { /* use defaults silently */ })
            .finally(() => setFetchLoading(false));
    }, []);

    const handleSavePreferences = async () => {
        setSaveLoading(true);
        setSaveSuccess(false);
        setSaveError(null);
        try {
            await apiRequest('/auth/preferences', {
                method: 'PATCH',
                body: JSON.stringify({ prefs: { appearance, learning, audio, accessibility, data } }),
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Failed to save preferences');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleResetToDefaults = () => {
        setAppearance(DEFAULT_APPEARANCE);
        setLearning(DEFAULT_LEARNING);
        setAudio(DEFAULT_AUDIO);
        setAccessibility(DEFAULT_ACCESSIBILITY);
        setData(DEFAULT_DATA);
    };

    const colorSchemes = [
        { value: 'green', label: 'Green', color: 'bg-green-500' },
        { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
        { value: 'red', label: 'Red', color: 'bg-red-500' },
        { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
        { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
    ];

    if (fetchLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="flex-shrink-0">
                                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                                <span className="hidden xs:inline">Back to Dashboard</span>
                                <span className="xs:hidden">Back</span>
                            </Button>
                            <div className="min-w-0">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Preferences</h1>
                                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Customize your learning experience</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                            <Button variant="outline" onClick={handleResetToDefaults} size="sm" className="flex-1 sm:flex-none">
                                <RotateCcw className="h-4 w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Reset to Defaults</span>
                                <span className="sm:hidden">Reset</span>
                            </Button>
                            <Button onClick={handleSavePreferences} disabled={saveLoading} size="sm" className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700">
                                {saveLoading ? (
                                    <><Loader2 className="h-4 w-4 mr-1 sm:mr-2 animate-spin" /><span>Saving...</span></>
                                ) : saveSuccess ? (
                                    <><CheckCircle className="h-4 w-4 mr-1 sm:mr-2" /><span>Saved!</span></>
                                ) : (
                                    <><Save className="h-4 w-4 mr-1 sm:mr-2" /><span className="hidden sm:inline">Save Changes</span><span className="sm:hidden">Save</span></>
                                )}
                            </Button>
                        </div>
                    </div>
                    {/* Error banner */}
                    {saveError && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {saveError}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                <Tabs defaultValue="appearance" className="space-y-4 sm:space-y-6">
                    <div className="overflow-x-auto">
                        <TabsList className="grid grid-cols-5 w-full min-w-[500px] sm:min-w-0">
                            <TabsTrigger value="appearance" className="text-xs sm:text-sm px-2 sm:px-4">
                                <span className="hidden sm:inline">Appearance</span>
                                <span className="sm:hidden">Look</span>
                            </TabsTrigger>
                            <TabsTrigger value="learning" className="text-xs sm:text-sm px-2 sm:px-4">
                                <span className="hidden sm:inline">Learning</span>
                                <span className="sm:hidden">Learn</span>
                            </TabsTrigger>
                            <TabsTrigger value="audio" className="text-xs sm:text-sm px-2 sm:px-4">Audio</TabsTrigger>
                            <TabsTrigger value="accessibility" className="text-xs sm:text-sm px-2 sm:px-4">
                                <span className="hidden sm:inline">Accessibility</span>
                                <span className="sm:hidden">A11y</span>
                            </TabsTrigger>
                            <TabsTrigger value="data" className="text-xs sm:text-sm px-2 sm:px-4">
                                <span className="hidden sm:inline">Data & Sync</span>
                                <span className="sm:hidden">Data</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Appearance */}
                    <TabsContent value="appearance" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader className="pb-4 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Theme & Display</CardTitle>
                                <CardDescription>Customize the visual appearance of your learning environment.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                <div className="space-y-3">
                                    <Label>Theme</Label>
                                    <RadioGroup
                                        value={appearance.theme}
                                        onValueChange={(v) => setAppearance({ ...appearance, theme: v })}
                                        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                                    >
                                        {[['light', 'Light', Sun], ['dark', 'Dark', Moon], ['system', 'System', Monitor]].map(([val, label, Icon]: any) => (
                                            <div key={val} className="flex items-center space-x-3 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                                                <RadioGroupItem value={val} id={val} />
                                                <Label htmlFor={val} className="flex items-center space-x-2 cursor-pointer flex-1">
                                                    <Icon className="h-4 w-4" /><span>{label}</span>
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                    <Label>Color Scheme</Label>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                                        {colorSchemes.map((s) => (
                                            <button key={s.value} onClick={() => setAppearance({ ...appearance, colorScheme: s.value })}
                                                className={`flex flex-col items-center space-y-2 p-2 sm:p-3 rounded-lg border-2 transition-colors ${appearance.colorScheme === s.value ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${s.color}`} />
                                                <span className="text-xs sm:text-sm font-medium">{s.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Font Size</Label>
                                        <Badge variant="outline">{appearance.fontSize}px</Badge>
                                    </div>
                                    <Slider value={[appearance.fontSize]} onValueChange={(v) => setAppearance({ ...appearance, fontSize: v[0] })} min={12} max={24} step={2} />
                                    <div className="flex justify-between text-xs text-gray-500"><span>Small</span><span>Large</span></div>
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    {[
                                        { key: 'compactMode', label: 'Compact Mode', desc: 'Use more compact spacing and smaller elements' },
                                        { key: 'animations', label: 'Animations', desc: 'Enable smooth transitions and animations' },
                                    ].map(({ key, label, desc }) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <div className="flex-1 pr-4"><p className="font-medium text-sm">{label}</p><p className="text-xs text-gray-500">{desc}</p></div>
                                            <Switch checked={(appearance as any)[key]} onCheckedChange={(v) => setAppearance({ ...appearance, [key]: v })} />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Learning */}
                    <TabsContent value="learning" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader className="pb-4 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Learning Preferences</CardTitle>
                                <CardDescription>Customize how you learn and interact with content.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                <div className="space-y-2">
                                    <Label>Interface Language</Label>
                                    <Select value={learning.language} onValueChange={(v) => setLearning({ ...learning, language: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="english">English</SelectItem>
                                            <SelectItem value="kiswahili">Kiswahili</SelectItem>
                                            <SelectItem value="french">French</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-base font-medium">Video Lessons</h3>
                                    {[
                                        { key: 'autoplay', label: 'Autoplay Next Lesson', desc: 'Automatically start the next lesson when current one ends' },
                                        { key: 'showSubtitles', label: 'Show Subtitles', desc: 'Display subtitles for video content' },
                                    ].map(({ key, label, desc }) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <div className="flex-1 pr-4"><p className="font-medium text-sm">{label}</p><p className="text-xs text-gray-500">{desc}</p></div>
                                            <Switch checked={(learning as any)[key]} onCheckedChange={(v) => setLearning({ ...learning, [key]: v })} />
                                        </div>
                                    ))}
                                    <div className="space-y-2">
                                        <Label>Default Playback Speed</Label>
                                        <Select value={learning.playbackSpeed.toString()} onValueChange={(v) => setLearning({ ...learning, playbackSpeed: parseFloat(v) })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {['0.75', '1.0', '1.25', '1.5', '2.0'].map((s) => (
                                                    <SelectItem key={s} value={s}>{s}x</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-base font-medium">Learning Goals</h3>
                                    <div className="space-y-2">
                                        <Label>Difficulty Level</Label>
                                        <Select value={learning.difficultyLevel} onValueChange={(v) => setLearning({ ...learning, difficultyLevel: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="beginner">Beginner — Start with basics</SelectItem>
                                                <SelectItem value="intermediate">Intermediate — Balanced challenge</SelectItem>
                                                <SelectItem value="advanced">Advanced — Maximum challenge</SelectItem>
                                                <SelectItem value="adaptive">Adaptive — Adjust automatically</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>Daily Study Goal</Label>
                                            <Badge variant="outline">{learning.dailyGoal} minutes</Badge>
                                        </div>
                                        <Slider value={[learning.dailyGoal]} onValueChange={(v) => setLearning({ ...learning, dailyGoal: v[0] })} min={15} max={180} step={15} />
                                        <div className="flex justify-between text-xs text-gray-500"><span>15 min</span><span>180 min</span></div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Preferred Study Time</Label>
                                        <Select value={learning.preferredStudyTime} onValueChange={(v) => setLearning({ ...learning, preferredStudyTime: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="morning">Morning (6:00 – 12:00)</SelectItem>
                                                <SelectItem value="afternoon">Afternoon (12:00 – 18:00)</SelectItem>
                                                <SelectItem value="evening">Evening (18:00 – 22:00)</SelectItem>
                                                <SelectItem value="anytime">No Preference</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4"><p className="font-medium text-sm">Study Reminders</p><p className="text-xs text-gray-500">Get reminded to study at your preferred time</p></div>
                                        <Switch checked={learning.studyReminders} onCheckedChange={(v) => setLearning({ ...learning, studyReminders: v })} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Audio */}
                    <TabsContent value="audio" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader className="pb-4 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Audio Settings</CardTitle>
                                <CardDescription>Control audio levels and sound preferences.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Master Volume</Label>
                                        <Badge variant="outline">{audio.masterVolume}%</Badge>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <VolumeX className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                        <Slider value={[audio.masterVolume]} onValueChange={(v) => setAudio({ ...audio, masterVolume: v[0] })} min={0} max={100} step={5} className="flex-1" />
                                        <Volume2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    {[
                                        { key: 'soundEffects', label: 'Sound Effects', desc: 'Button clicks, notifications, and interaction sounds' },
                                        { key: 'backgroundMusic', label: 'Background Music', desc: 'Soft background music during lessons' },
                                        { key: 'voiceNarration', label: 'Voice Narration', desc: 'Spoken explanations and instructions' },
                                        { key: 'keyboardSounds', label: 'Keyboard Sounds', desc: 'Typing sounds when entering answers' },
                                    ].map(({ key, label, desc }) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <div className="flex-1 pr-4"><p className="font-medium text-sm">{label}</p><p className="text-xs text-gray-500">{desc}</p></div>
                                            <Switch checked={(audio as any)[key]} onCheckedChange={(v) => setAudio({ ...audio, [key]: v })} />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Accessibility */}
                    <TabsContent value="accessibility" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader className="pb-4 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Accessibility Options</CardTitle>
                                <CardDescription>Features to make learning more accessible for everyone.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { key: 'highContrast', label: 'High Contrast Mode', desc: 'Increase contrast for better visibility' },
                                    { key: 'largeText', label: 'Large Text', desc: 'Use larger text throughout the interface' },
                                    { key: 'reduceMotion', label: 'Reduce Motion', desc: 'Minimize animations and motion effects' },
                                    { key: 'screenReader', label: 'Screen Reader Support', desc: 'Optimize for screen reader compatibility' },
                                    { key: 'keyboardNavigation', label: 'Keyboard Navigation', desc: 'Enhanced keyboard navigation support' },
                                ].map(({ key, label, desc }) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <div className="flex-1 pr-4"><p className="font-medium text-sm">{label}</p><p className="text-xs text-gray-500">{desc}</p></div>
                                        <Switch checked={(accessibility as any)[key]} onCheckedChange={(v) => setAccessibility({ ...accessibility, [key]: v })} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Data & Sync */}
                    <TabsContent value="data" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader className="pb-4 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Data & Synchronization</CardTitle>
                                <CardDescription>Manage how your data is stored and synchronized across devices.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                <div className="space-y-4">
                                    {[
                                        { key: 'autoDownload', label: 'Auto Download Lessons', desc: 'Automatically download lessons for offline access' },
                                        { key: 'dataSaver', label: 'Data Saver Mode', desc: 'Reduce data usage for mobile connections' },
                                        { key: 'offlineMode', label: 'Offline Mode', desc: 'Access downloaded content without internet' },
                                        { key: 'syncAcrossDevices', label: 'Sync Across Devices', desc: 'Keep progress synchronized across all your devices' },
                                    ].map(({ key, label, desc }) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <div className="flex-1 pr-4"><p className="font-medium text-sm">{label}</p><p className="text-xs text-gray-500">{desc}</p></div>
                                            <Switch checked={(data as any)[key]} onCheckedChange={(v) => setData({ ...data, [key]: v })} />
                                        </div>
                                    ))}
                                    <div className="space-y-2">
                                        <Label>Download Quality</Label>
                                        <Select value={data.downloadQuality} onValueChange={(v) => setData({ ...data, downloadQuality: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low — Save data (480p)</SelectItem>
                                                <SelectItem value="medium">Medium — Balanced (720p)</SelectItem>
                                                <SelectItem value="high">High — Best quality (1080p)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-base font-medium">Storage Usage</h3>
                                    <div className="space-y-2">
                                        {[
                                            { icon: BookOpen, label: 'Downloaded Lessons', size: '2.3 GB' },
                                            { icon: Settings, label: 'App Data', size: '156 MB' },
                                            { icon: Download, label: 'Cache', size: '89 MB' },
                                        ].map(({ icon: Icon, label, size }) => (
                                            <div key={label} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-2">
                                                    <Icon className="h-4 w-4 text-gray-600" />
                                                    <span className="font-medium text-sm">{label}</span>
                                                </div>
                                                <span className="text-xs text-gray-600">{size}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="outline" className="w-full text-sm">
                                        <Trash2 className="h-4 w-4 mr-2" />Clear Cache
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="h-4 sm:h-0" />
            </div>
        </div>
    );
}
