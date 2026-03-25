'use client'

import React, { useState } from 'react';
import {
    Monitor,
    Moon,
    Sun,
    Volume2,
    VolumeX,
    Globe,
    Smartphone,
    Download,
    ArrowLeft,
    Save,
    RotateCcw,
    BookOpen,
    Clock,
    Target,
    Palette,
    Settings,
    Trash2
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

export default function PreferencesPage() {
    const [isLoading, setIsLoading] = useState(false);

    // Appearance preferences
    const [appearance, setAppearance] = useState({
        theme: 'system',
        colorScheme: 'green',
        fontSize: 16,
        compactMode: false,
        animations: true
    });

    // Learning preferences
    const [learning, setLearning] = useState({
        language: 'english',
        autoplay: true,
        showSubtitles: true,
        playbackSpeed: 1.0,
        difficultyLevel: 'adaptive',
        studyReminders: true,
        dailyGoal: 60, // minutes
        preferredStudyTime: 'afternoon'
    });

    // Audio preferences
    const [audio, setAudio] = useState({
        masterVolume: 80,
        soundEffects: true,
        backgroundMusic: false,
        voiceNarration: true,
        keyboardSounds: true
    });

    // Accessibility preferences
    const [accessibility, setAccessibility] = useState({
        highContrast: false,
        largeText: false,
        reduceMotion: false,
        screenReader: false,
        keyboardNavigation: true
    });

    // Data preferences
    const [data, setData] = useState({
        autoDownload: true,
        downloadQuality: 'medium',
        dataSaver: false,
        offlineMode: true,
        syncAcrossDevices: true
    });

    const handleSavePreferences = async () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            console.log('Preferences saved:', { appearance, learning, audio, accessibility, data });
        }, 1500);
    };

    const handleResetToDefaults = () => {
        setAppearance({
            theme: 'system',
            colorScheme: 'green',
            fontSize: 16,
            compactMode: false,
            animations: true
        });
        setLearning({
            language: 'english',
            autoplay: true,
            showSubtitles: true,
            playbackSpeed: 1.0,
            difficultyLevel: 'adaptive',
            studyReminders: true,
            dailyGoal: 60,
            preferredStudyTime: 'afternoon'
        });
        setAudio({
            masterVolume: 80,
            soundEffects: true,
            backgroundMusic: false,
            voiceNarration: true,
            keyboardSounds: true
        });
        setAccessibility({
            highContrast: false,
            largeText: false,
            reduceMotion: false,
            screenReader: false,
            keyboardNavigation: true
        });
        setData({
            autoDownload: true,
            downloadQuality: 'medium',
            dataSaver: false,
            offlineMode: true,
            syncAcrossDevices: true
        });
    };

    const goBack = () => {
        window.history.back();
    };

    const colorSchemes = [
        { value: 'green', label: 'Green', color: 'bg-green-500' },
        { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
        { value: 'red', label: 'Red', color: 'bg-red-500' },
        { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
        { value: 'orange', label: 'Orange', color: 'bg-orange-500' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <Button variant="ghost" size="sm" onClick={goBack} className="flex-shrink-0">
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
                            <Button onClick={handleSavePreferences} disabled={isLoading} size="sm" className="flex-1 sm:flex-none">
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1 sm:mr-2" />
                                        <span className="hidden sm:inline">Saving...</span>
                                        <span className="sm:hidden">Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-1 sm:mr-2" />
                                        <span className="hidden sm:inline">Save Changes</span>
                                        <span className="sm:hidden">Save</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
                <Tabs defaultValue="appearance" className="space-y-4 sm:space-y-6">
                    {/* Mobile: Scrollable tabs, Desktop: Grid */}
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

                    {/* Appearance Tab */}
                    <TabsContent value="appearance" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader className="pb-4 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Theme & Display</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Customize the visual appearance of your learning environment.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                {/* Theme Selection */}
                                <div className="space-y-3">
                                    <Label className="text-sm sm:text-base">Theme</Label>
                                    <RadioGroup
                                        value={appearance.theme}
                                        onValueChange={(value) => setAppearance({ ...appearance, theme: value })}
                                        className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
                                    >
                                        <div className="flex items-center space-x-3 border rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-gray-50">
                                            <RadioGroupItem value="light" id="light" />
                                            <Label htmlFor="light" className="flex items-center space-x-2 cursor-pointer flex-1">
                                                <Sun className="h-4 w-4" />
                                                <span>Light</span>
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-3 border rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-gray-50">
                                            <RadioGroupItem value="dark" id="dark" />
                                            <Label htmlFor="dark" className="flex items-center space-x-2 cursor-pointer flex-1">
                                                <Moon className="h-4 w-4" />
                                                <span>Dark</span>
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-3 border rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-gray-50">
                                            <RadioGroupItem value="system" id="system" />
                                            <Label htmlFor="system" className="flex items-center space-x-2 cursor-pointer flex-1">
                                                <Monitor className="h-4 w-4" />
                                                <span>System</span>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <Separator />

                                {/* Color Scheme */}
                                <div className="space-y-3">
                                    <Label className="text-sm sm:text-base">Color Scheme</Label>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                                        {colorSchemes.map((scheme) => (
                                            <button
                                                key={scheme.value}
                                                onClick={() => setAppearance({ ...appearance, colorScheme: scheme.value })}
                                                className={`flex flex-col items-center space-y-2 p-2 sm:p-3 rounded-lg border-2 transition-colors ${appearance.colorScheme === scheme.value
                                                        ? 'border-gray-900 bg-gray-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${scheme.color}`} />
                                                <span className="text-xs sm:text-sm font-medium">{scheme.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Separator />

                                {/* Font Size */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm sm:text-base">Font Size</Label>
                                        <Badge variant="outline" className="text-xs sm:text-sm">{appearance.fontSize}px</Badge>
                                    </div>
                                    <Slider
                                        value={[appearance.fontSize]}
                                        onValueChange={(value) => setAppearance({ ...appearance, fontSize: value[0] })}
                                        min={12}
                                        max={24}
                                        step={2}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                                        <span>Small</span>
                                        <span>Large</span>
                                    </div>
                                </div>

                                <Separator />

                                {/* Display Options */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Compact Mode</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Use more compact spacing and smaller elements</p>
                                        </div>
                                        <Switch
                                            checked={appearance.compactMode}
                                            onCheckedChange={(checked) => setAppearance({ ...appearance, compactMode: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Animations</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Enable smooth transitions and animations</p>
                                        </div>
                                        <Switch
                                            checked={appearance.animations}
                                            onCheckedChange={(checked) => setAppearance({ ...appearance, animations: checked })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Learning Tab */}
                    <TabsContent value="learning" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader className="pb-4 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Learning Preferences</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Customize how you learn and interact with content.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                {/* Language */}
                                <div className="space-y-2">
                                    <Label htmlFor="language" className="text-sm sm:text-base">Interface Language</Label>
                                    <Select
                                        value={learning.language}
                                        onValueChange={(value) => setLearning({ ...learning, language: value })}
                                    >
                                        <SelectTrigger className="text-sm sm:text-base">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="english">English</SelectItem>
                                            <SelectItem value="kiswahili">Kiswahili</SelectItem>
                                            <SelectItem value="french">French</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Separator />

                                {/* Video Preferences */}
                                <div className="space-y-4">
                                    <h3 className="text-base sm:text-lg font-medium">Video Lessons</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Autoplay Next Lesson</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Automatically start the next lesson when current one ends</p>
                                        </div>
                                        <Switch
                                            checked={learning.autoplay}
                                            onCheckedChange={(checked) => setLearning({ ...learning, autoplay: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Show Subtitles</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Display subtitles for video content</p>
                                        </div>
                                        <Switch
                                            checked={learning.showSubtitles}
                                            onCheckedChange={(checked) => setLearning({ ...learning, showSubtitles: checked })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm sm:text-base">Default Playback Speed</Label>
                                        <Select
                                            value={learning.playbackSpeed.toString()}
                                            onValueChange={(value) => setLearning({ ...learning, playbackSpeed: parseFloat(value) })}
                                        >
                                            <SelectTrigger className="text-sm sm:text-base">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0.75">0.75x (Slower)</SelectItem>
                                                <SelectItem value="1.0">1.0x (Normal)</SelectItem>
                                                <SelectItem value="1.25">1.25x (Faster)</SelectItem>
                                                <SelectItem value="1.5">1.5x (Much Faster)</SelectItem>
                                                <SelectItem value="2.0">2.0x (Very Fast)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator />

                                {/* Difficulty & Goals */}
                                <div className="space-y-4">
                                    <h3 className="text-base sm:text-lg font-medium">Learning Goals</h3>
                                    <div className="space-y-2">
                                        <Label className="text-sm sm:text-base">Difficulty Level</Label>
                                        <Select
                                            value={learning.difficultyLevel}
                                            onValueChange={(value) => setLearning({ ...learning, difficultyLevel: value })}
                                        >
                                            <SelectTrigger className="text-sm sm:text-base">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="beginner">Beginner - Start with basics</SelectItem>
                                                <SelectItem value="intermediate">Intermediate - Balanced challenge</SelectItem>
                                                <SelectItem value="advanced">Advanced - Maximum challenge</SelectItem>
                                                <SelectItem value="adaptive">Adaptive - Adjust automatically</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm sm:text-base">Daily Study Goal</Label>
                                            <Badge variant="outline" className="text-xs sm:text-sm">{learning.dailyGoal} minutes</Badge>
                                        </div>
                                        <Slider
                                            value={[learning.dailyGoal]}
                                            onValueChange={(value) => setLearning({ ...learning, dailyGoal: value[0] })}
                                            min={15}
                                            max={180}
                                            step={15}
                                            className="w-full"
                                        />
                                        <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                                            <span>15 min</span>
                                            <span>180 min</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm sm:text-base">Preferred Study Time</Label>
                                        <Select
                                            value={learning.preferredStudyTime}
                                            onValueChange={(value) => setLearning({ ...learning, preferredStudyTime: value })}
                                        >
                                            <SelectTrigger className="text-sm sm:text-base">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="morning">Morning (6:00 - 12:00)</SelectItem>
                                                <SelectItem value="afternoon">Afternoon (12:00 - 18:00)</SelectItem>
                                                <SelectItem value="evening">Evening (18:00 - 22:00)</SelectItem>
                                                <SelectItem value="anytime">No Preference</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Study Reminders</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Get reminded to study at your preferred time</p>
                                        </div>
                                        <Switch
                                            checked={learning.studyReminders}
                                            onCheckedChange={(checked) => setLearning({ ...learning, studyReminders: checked })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Audio Tab */}
                    <TabsContent value="audio" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader className="pb-4 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Audio Settings</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Control audio levels and sound preferences.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                {/* Master Volume */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm sm:text-base">Master Volume</Label>
                                        <Badge variant="outline" className="text-xs sm:text-sm">{audio.masterVolume}%</Badge>
                                    </div>
                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                        <VolumeX className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                        <Slider
                                            value={[audio.masterVolume]}
                                            onValueChange={(value) => setAudio({ ...audio, masterVolume: value[0] })}
                                            min={0}
                                            max={100}
                                            step={5}
                                            className="flex-1"
                                        />
                                        <Volume2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                    </div>
                                </div>

                                <Separator />

                                {/* Audio Options */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Sound Effects</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Button clicks, notifications, and interaction sounds</p>
                                        </div>
                                        <Switch
                                            checked={audio.soundEffects}
                                            onCheckedChange={(checked) => setAudio({ ...audio, soundEffects: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Background Music</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Soft background music during lessons</p>
                                        </div>
                                        <Switch
                                            checked={audio.backgroundMusic}
                                            onCheckedChange={(checked) => setAudio({ ...audio, backgroundMusic: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Voice Narration</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Spoken explanations and instructions</p>
                                        </div>
                                        <Switch
                                            checked={audio.voiceNarration}
                                            onCheckedChange={(checked) => setAudio({ ...audio, voiceNarration: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Keyboard Sounds</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Typing sounds when entering answers</p>
                                        </div>
                                        <Switch
                                            checked={audio.keyboardSounds}
                                            onCheckedChange={(checked) => setAudio({ ...audio, keyboardSounds: checked })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Accessibility Tab */}
                    <TabsContent value="accessibility" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader className="pb-4 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Accessibility Options</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Features to make learning more accessible for everyone.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">High Contrast Mode</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Increase contrast for better visibility</p>
                                        </div>
                                        <Switch
                                            checked={accessibility.highContrast}
                                            onCheckedChange={(checked) => setAccessibility({ ...accessibility, highContrast: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Large Text</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Use larger text throughout the interface</p>
                                        </div>
                                        <Switch
                                            checked={accessibility.largeText}
                                            onCheckedChange={(checked) => setAccessibility({ ...accessibility, largeText: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Reduce Motion</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Minimize animations and motion effects</p>
                                        </div>
                                        <Switch
                                            checked={accessibility.reduceMotion}
                                            onCheckedChange={(checked) => setAccessibility({ ...accessibility, reduceMotion: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Screen Reader Support</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Optimize for screen reader compatibility</p>
                                        </div>
                                        <Switch
                                            checked={accessibility.screenReader}
                                            onCheckedChange={(checked) => setAccessibility({ ...accessibility, screenReader: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Keyboard Navigation</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Enhanced keyboard navigation support</p>
                                        </div>
                                        <Switch
                                            checked={accessibility.keyboardNavigation}
                                            onCheckedChange={(checked) => setAccessibility({ ...accessibility, keyboardNavigation: checked })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Data & Sync Tab */}
                    <TabsContent value="data" className="space-y-4 sm:space-y-6">
                        <Card>
                            <CardHeader className="pb-4 sm:pb-6">
                                <CardTitle className="text-lg sm:text-xl">Data & Synchronization</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Manage how your data is stored and synchronized across devices.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Auto Download Lessons</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Automatically download lessons for offline access</p>
                                        </div>
                                        <Switch
                                            checked={data.autoDownload}
                                            onCheckedChange={(checked) => setData({ ...data, autoDownload: checked })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm sm:text-base">Download Quality</Label>
                                        <Select
                                            value={data.downloadQuality}
                                            onValueChange={(value) => setData({ ...data, downloadQuality: value })}
                                        >
                                            <SelectTrigger className="text-sm sm:text-base">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low - Save data (480p)</SelectItem>
                                                <SelectItem value="medium">Medium - Balanced (720p)</SelectItem>
                                                <SelectItem value="high">High - Best quality (1080p)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Data Saver Mode</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Reduce data usage for mobile connections</p>
                                        </div>
                                        <Switch
                                            checked={data.dataSaver}
                                            onCheckedChange={(checked) => setData({ ...data, dataSaver: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Offline Mode</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Access downloaded content without internet</p>
                                        </div>
                                        <Switch
                                            checked={data.offlineMode}
                                            onCheckedChange={(checked) => setData({ ...data, offlineMode: checked })}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className="font-medium text-sm sm:text-base">Sync Across Devices</p>
                                            <p className="text-xs sm:text-sm text-gray-500">Keep progress synchronized across all your devices</p>
                                        </div>
                                        <Switch
                                            checked={data.syncAcrossDevices}
                                            onCheckedChange={(checked) => setData({ ...data, syncAcrossDevices: checked })}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                {/* Storage Information */}
                                <div className="space-y-4">
                                    <h3 className="text-base sm:text-lg font-medium">Storage Usage</h3>
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                <BookOpen className="h-4 w-4 text-gray-600 flex-shrink-0" />
                                                <span className="font-medium text-sm sm:text-base truncate">Downloaded Lessons</span>
                                            </div>
                                            <span className="text-xs sm:text-sm text-gray-600 ml-2">2.3 GB</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                <Settings className="h-4 w-4 text-gray-600 flex-shrink-0" />
                                                <span className="font-medium text-sm sm:text-base truncate">App Data</span>
                                            </div>
                                            <span className="text-xs sm:text-sm text-gray-600 ml-2">156 MB</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                                                <Download className="h-4 w-4 text-gray-600 flex-shrink-0" />
                                                <span className="font-medium text-sm sm:text-base truncate">Cache</span>
                                            </div>
                                            <span className="text-xs sm:text-sm text-gray-600 ml-2">89 MB</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full text-sm sm:text-base">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Clear Cache
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Mobile bottom padding for fixed headers */}
                <div className="h-4 sm:h-0"></div>
            </div>
        </div>
    );
}