import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCreateThemeMutation } from "@/features/theme/themeApiSlice";
import useImageUpload from "@/hooks/useImageUpload";

const schema = yup.object().shape({
  domainUrl: yup
    .string()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
  logo: yup.string().nullable(),
  primaryColorCode: yup
    .string()
    .nullable()
    .matches(/^#[0-9A-F]{6}$/i, {
      message: "Primary color code must be a valid hex color (e.g., #FF5733)",
    })
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
  secondaryColorCode: yup
    .string()
    .nullable()
    .matches(/^#[0-9A-F]{6}$/i, {
      message: "Secondary color code must be a valid hex color (e.g., #FF5733)",
    })
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
});

const MaterialIcon = ({ children, className = "", filled = false }) => (
  <span
    className={`material-symbols-outlined select-none ${className}`}
    style={{
      fontVariationSettings: `"FILL" ${filled ? 1 : 0}, "wght" 400, "GRAD" 0, "opsz" 24`,
    }}
  >
    {children}
  </span>
);

const ThemeCreatePage = () => {
  const navigate = useNavigate();
  const [createTheme, { isLoading }] = useCreateThemeMutation();
  const { uploadImage, isUploading } = useImageUpload();
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [surfaceBlur, setSurfaceBlur] = useState(20);
  const [noiseTexture, setNoiseTexture] = useState(15);
  const [glowEnabled, setGlowEnabled] = useState(true);
  const [glowAttenuation, setGlowAttenuation] = useState(35);
  const [systemDesignation, setSystemDesignation] = useState("AETHER COMMAND");
  const [operationalSubtext, setOperationalSubtext] = useState("COMMAND CENTER");
  const [themeName, setThemeName] = useState("International Standard 2024");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      domainUrl: "",
      logo: "",
      primaryColorCode: "#3525CD",
      secondaryColorCode: "#006780",
    },
  });

  const primaryColorCode = watch("primaryColorCode");
  const secondaryColorCode = watch("secondaryColorCode");
  const resolvedPrimary = /^#[0-9A-F]{6}$/i.test(primaryColorCode)
    ? primaryColorCode
    : "#3525CD";
  const resolvedSecondary = /^#[0-9A-F]{6}$/i.test(secondaryColorCode)
    ? secondaryColorCode
    : "#006780";

  const previewEngineScore = useMemo(() => {
    const blurFactor = Math.min(surfaceBlur / 20, 1.4);
    const noiseFactor = 1 - Math.min(noiseTexture / 100, 0.4);
    const glowFactor = glowEnabled ? 1.05 : 0.94;
    const score = 84 + blurFactor * 6 + noiseFactor * 4 * glowFactor;
    return Math.min(score, 98.4).toFixed(1);
  }, [glowEnabled, noiseTexture, surfaceBlur]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoFile(null);
      setLogoPreview(null);
      setValue("logo", "");
    }
  };

  const onSubmit = async (data) => {
    let logoUrl = data.logo;

    if (logoFile) {
      logoUrl = await uploadImage(logoFile);
      if (!logoUrl) {
        return;
      }
    }

    let formattedDomain = data.domainUrl ? data.domainUrl.trim() : "";
    if (formattedDomain && !formattedDomain.startsWith("http://") && !formattedDomain.startsWith("https://")) {
      formattedDomain = `https://${formattedDomain}`;
    }

    const payload = {
      ...(formattedDomain && { domainUrl: formattedDomain }),
      ...(logoUrl && { logo: logoUrl }),
      ...(data.primaryColorCode && { primaryColorCode: data.primaryColorCode }),
      ...(data.secondaryColorCode && {
        secondaryColorCode: data.secondaryColorCode,
      }),
    };

    if (Object.keys(payload).length === 0) {
      toast.error("Please fill in at least one field");
      return;
    }

    const res = await createTheme(payload);
    if (res?.data || !res?.error) {
      toast.success("Theme created successfully");
      navigate("/superadmin/themes");
    } else {
      toast.error(res?.error?.data?.message || "Failed to create theme");
    }
  };

  const applyPresetTemplate = (primary, secondary) => {
    setValue("primaryColorCode", primary, { shouldValidate: true });
    setValue("secondaryColorCode", secondary, { shouldValidate: true });
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-[#777587] text-[12px] mb-2 font-semibold">
            <span className="uppercase tracking-wider">Settings</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="uppercase tracking-wider">Appearance</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#3525cd] font-bold uppercase tracking-wider">Themes</span>
          </nav>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/superadmin/themes")}
              className="h-10 w-10 rounded-full border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-[-0.02em] text-[#1b1b24] leading-tight">Create New Theme</h2>
              <p className="text-sm text-[#777587] mt-1">Configure your brand assets and international interface colors.</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/superadmin/themes")}
            className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 transition-all text-sm"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading || isUploading}
            className="px-8 py-2.5 rounded-xl bg-[#3525cd] text-white font-bold shadow-md shadow-[#3525cd]/20 hover:translate-y-[-2px] transition-all disabled:opacity-60 text-sm flex items-center gap-2"
          >
            {isLoading || isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Theme...</span>
              </>
            ) : (
              <span>Save Theme</span>
            )}
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Brand Identity Card & Rendering Effects (col-span-8) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Brand Identity Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#eae6f4] transition-transform duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#e2dfff] rounded-lg text-[#3525cd]">
                  <span className="material-symbols-outlined text-[24px]">branding_watermark</span>
                </div>
                <h3 className="text-[20px] font-semibold text-[#1b1b24]">Brand Identity</h3>
              </div>
              <span className="px-3 py-1 bg-[#10b981]/10 text-[#10b981] text-[10px] font-extrabold rounded-full uppercase tracking-widest">Active Step</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Form Fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-[12px] font-semibold text-[#777587] mb-2 uppercase tracking-wider">Theme Name</label>
                  <input
                    className="w-full px-4 py-3 bg-[#f0ecf9] border border-transparent rounded-xl focus:ring-2 focus:ring-[#3525cd] focus:bg-white focus:border-transparent transition-all outline-none text-[#1b1b24] text-[14px]"
                    type="text"
                    value={themeName}
                    onChange={(e) => setThemeName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#777587] mb-2 uppercase tracking-wider">Custom Domain URL</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm">https://</span>
                    <input
                      {...register("domainUrl")}
                      className="flex-1 px-4 py-3 bg-[#f0ecf9] border border-transparent rounded-r-xl focus:ring-2 focus:ring-[#3525cd] focus:bg-white focus:border-transparent transition-all outline-none text-[#1b1b24] text-[14px]"
                      placeholder="portal.squadlog.com"
                      type="text"
                    />
                  </div>
                  {errors.domainUrl ? (
                    <p className="text-xs text-red-500 mt-2">{errors.domainUrl.message}</p>
                  ) : (
                    <p className="text-xs text-[#777587] mt-2">Pointing your domain will update SSL certificates automatically.</p>
                  )}
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#777587] mb-2 uppercase tracking-wider">Logo Upload</label>
                  <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-[#f5f2ff] hover:border-[#3525cd] transition-all cursor-pointer group text-center min-h-[140px]">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="absolute inset-0 z-10 cursor-pointer opacity-0"
                    />
                    <span className="material-symbols-outlined text-4xl text-gray-400 group-hover:text-[#3525cd] transition-colors mb-2">upload_file</span>
                    <p className="font-bold text-gray-700">Drag &amp; Drop brand logo</p>
                    <p className="text-xs text-gray-500">PNG or SVG, max 5MB (400x100px recommended)</p>
                  </div>
                </div>
              </div>

              {/* Right: Preview Area */}
              <div className="bg-[#f8f9fc] rounded-2xl p-6 border border-gray-100 relative overflow-hidden flex flex-col items-center justify-center text-center">
                <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, ${resolvedPrimary}, ${resolvedSecondary})` }}></div>
                <div className="w-24 h-24 bg-white rounded-full shadow-md flex items-center justify-center mb-4 border border-gray-100 overflow-hidden p-2">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="material-symbols-outlined text-4xl text-gray-300">image</span>
                  )}
                </div>
                <h4 className="font-bold text-[#1b1b24]">Live Preview</h4>
                <p className="text-sm text-[#777587] mb-6">How your brand appears in the header</p>
                <div className="w-full h-12 bg-white shadow-sm rounded-lg flex items-center px-4 gap-3 border border-gray-100">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-6 object-contain" />
                  ) : (
                    <div className="w-6 h-6 rounded-md" style={{ backgroundColor: resolvedPrimary }}></div>
                  )}
                  <div className="h-2 w-24 bg-gray-200 rounded-full"></div>
                  <div className="ml-auto flex gap-1.5">
                    <div className="w-6 h-2 bg-gray-100 rounded-full"></div>
                    <div className="w-6 h-2 bg-gray-100 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rendering Effects Controls */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#eae6f4]">
            <div className="mb-6 flex items-center gap-3">
              <MaterialIcon className="text-[22px] text-[#3525cd]">auto_awesome</MaterialIcon>
              <h2 className="text-[20px] font-semibold text-[#1b1b24]">Rendering Effects</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-semibold">Backdrop Blur</span>
                    <span className="text-sm text-[#3525cd] font-bold">{surfaceBlur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={surfaceBlur}
                    onChange={(event) => setSurfaceBlur(Number(event.target.value))}
                    className="w-full accent-[#3525cd]"
                  />
                  <p className="mt-2 text-xs text-[#777587]">
                    Depth intensity for glass layers
                  </p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-semibold">Glow Attenuation</span>
                    <span className="text-sm text-[#3525cd] font-bold">{glowAttenuation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={glowAttenuation}
                    onChange={(event) => setGlowAttenuation(Number(event.target.value))}
                    className="w-full accent-[#3525cd]"
                  />
                  <p className="mt-2 text-xs text-[#777587]">
                    Bloom radius for active elements
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-semibold">Noise Texture</span>
                    <span className="text-sm text-[#3525cd] font-bold">{noiseTexture}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={noiseTexture}
                    onChange={(event) => setNoiseTexture(Number(event.target.value))}
                    className="w-full accent-[#3525cd]"
                  />
                </div>

                <div className="flex items-center justify-between rounded-[24px] border border-gray-100 bg-[#f8f9fc] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#1b1b24]">Glow Effects</p>
                    <p className="mt-1 text-xs text-[#777587]">Live accent rendering</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGlowEnabled((value) => !value)}
                    className={`relative h-7 w-12 rounded-full transition-colors ${
                      glowEnabled ? "bg-[#3525cd]" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                        glowEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Color Scheme & Render Previews (col-span-4) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Color Scheme Picker */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#eae6f4]">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-[#f0dbff] rounded-lg text-[#6b00b8]">
                <span className="material-symbols-outlined text-[24px]">palette</span>
              </div>
              <h3 className="text-[20px] font-semibold text-[#1b1b24]">Color Scheme</h3>
            </div>

            <div className="space-y-8">
              {/* Primary Color Picker */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[12px] font-semibold text-[#777587] uppercase tracking-wider">Primary Color</label>
                  <span className="text-xs font-mono font-bold text-[#3525cd]">{resolvedPrimary}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["#3525CD", "#4D44E3", "#6B00B8", "#006780"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setValue("primaryColorCode", color, { shouldValidate: true })}
                      type="button"
                      className={`w-10 h-10 rounded-xl transition-all ${
                        resolvedPrimary.toUpperCase() === color.toUpperCase() ? "ring-2 ring-[#3525cd] ring-offset-2 scale-95" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                  <div className="relative w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors overflow-hidden">
                    <span className="material-symbols-outlined text-[20px] text-gray-500">colorize</span>
                    <input
                      type="color"
                      value={resolvedPrimary}
                      onChange={(e) => setValue("primaryColorCode", e.target.value, { shouldValidate: true })}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Secondary Color Picker */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[12px] font-semibold text-[#777587] uppercase tracking-wider">Accent Color</label>
                  <span className="text-xs font-mono font-bold text-[#006780]">{resolvedSecondary}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["#006780", "#10B981", "#F59E0B", "#EF4444"].map((color) => (
                    <button
                      key={color}
                      onClick={() => setValue("secondaryColorCode", color, { shouldValidate: true })}
                      type="button"
                      className={`w-10 h-10 rounded-xl transition-all ${
                        resolvedSecondary.toUpperCase() === color.toUpperCase() ? "ring-2 ring-[#006780] ring-offset-2 scale-95" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                  <div className="relative w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors overflow-hidden">
                    <span className="material-symbols-outlined text-[20px] text-gray-500">colorize</span>
                    <input
                      type="color"
                      value={resolvedSecondary}
                      onChange={(e) => setValue("secondaryColorCode", e.target.value, { shouldValidate: true })}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Mini Live Preview / Token Mapping */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-bold text-[#777587] uppercase tracking-widest mb-4">Live Token Mapping</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Main Button</span>
                    <div
                      className="px-4 py-1.5 rounded-lg text-white text-xs font-bold shadow-sm"
                      style={{ backgroundColor: resolvedPrimary }}
                    >
                      Click Me
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">System Alert</span>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        backgroundColor: resolvedSecondary,
                        boxShadow: `0 0 8px ${resolvedSecondary}88`,
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Link Hover</span>
                    <span
                      className="text-xs font-bold underline decoration-2 underline-offset-4 cursor-pointer"
                      style={{ color: resolvedPrimary, decorationColor: resolvedPrimary }}
                    >
                      Read Documentation
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Render Box Preview */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#eae6f4] space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[12px] font-semibold text-[#777587] uppercase tracking-wider">Preview Engine</p>
                <div className="text-3xl font-extrabold text-[#1b1b24] tracking-tight leading-none mt-2">
                  {previewEngineScore}%
                </div>
              </div>
              <span className="bg-[#10b981]/10 text-[#10b981] text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                Live Feed
              </span>
            </div>

            <div
              className="rounded-[28px] border border-gray-200 p-5"
              style={{
                background: `linear-gradient(135deg, ${resolvedPrimary}22, ${resolvedSecondary}16 45%, #ffffff)`,
                boxShadow: glowEnabled
                  ? `0 0 ${glowAttenuation}px ${resolvedSecondary}33`
                  : "none",
              }}
            >
              <div className="mb-4 h-2 w-16 bg-gray-200 rounded-full" />
              <div className="rounded-[24px] border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-150">
                      <MaterialIcon className="text-[20px] text-gray-500">deployed_code</MaterialIcon>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1b1b24]">{systemDesignation}</p>
                      <p className="text-xs text-gray-500">{operationalSubtext}</p>
                    </div>
                  </div>
                  <div className="h-5 w-5 rounded-full border border-gray-200 bg-gray-100" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Templates Section */}
      <div className="col-span-12 bg-white rounded-3xl p-6 shadow-sm border border-[#eae6f4] overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-[20px] font-semibold text-[#1b1b24]">Preset Templates</h3>
            <p className="text-sm text-[#777587] mt-1">Start with a professionally curated international style.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Template 1 */}
          <div
            onClick={() => applyPresetTemplate("#3525CD", "#006780")}
            className={`group relative rounded-2xl overflow-hidden border cursor-pointer hover:shadow-xl transition-all duration-300 ${
              resolvedPrimary.toUpperCase() === "#3525CD" && resolvedSecondary.toUpperCase() === "#006780" ? "border-[#3525cd] ring-2 ring-[#3525cd]" : "border-gray-100"
            }`}
          >
            <div className="h-40 w-full bg-gray-50 p-4 flex flex-col gap-2 relative overflow-hidden">
              <div className="w-1/2 h-4 bg-[#e2dfff] rounded-full"></div>
              <div className="w-full h-2 bg-gray-200 rounded-full"></div>
              <div className="w-3/4 h-2 bg-gray-200 rounded-full"></div>
              <div className="mt-auto flex justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#3525cd]/10 flex items-center justify-center text-[#3525cd]">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-12 h-6 rounded-full bg-[#006780]/20"></div>
                  <div className="w-12 h-6 rounded-full bg-[#3525cd]/20"></div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white border-t border-gray-50">
              <h4 className="font-bold text-[#1b1b24]">Neo-Corporate</h4>
              <p className="text-xs text-[#777587]">Clean, Indigo-focused, High Density</p>
            </div>
          </div>

          {/* Template 2 */}
          <div
            onClick={() => applyPresetTemplate("#6B00B8", "#10B981")}
            className={`group relative rounded-2xl overflow-hidden border cursor-pointer hover:shadow-xl transition-all duration-300 ${
              resolvedPrimary.toUpperCase() === "#6B00B8" && resolvedSecondary.toUpperCase() === "#10B981" ? "border-[#3525cd] ring-2 ring-[#3525cd]" : "border-gray-100"
            }`}
          >
            <div className="h-40 w-full bg-[#fcf8ff] p-4 flex flex-col gap-2 relative overflow-hidden">
              <div className="w-1/2 h-4 bg-[#f0dbff] rounded-full"></div>
              <div className="w-full h-2 bg-gray-200 rounded-full"></div>
              <div className="w-3/4 h-2 bg-gray-200 rounded-full"></div>
              <div className="mt-auto flex justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#6b00b8]/10 flex items-center justify-center text-[#6b00b8]">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-12 h-6 rounded-full bg-[#10b981]/20"></div>
                  <div className="w-12 h-6 rounded-full bg-[#6b00b8]/10"></div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white border-t border-gray-50">
              <h4 className="font-bold text-[#1b1b24]">International Standard</h4>
              <p className="text-xs text-[#777587]">Glassmorphism, Purple accents, Modern Soft</p>
            </div>
          </div>

          {/* Template 3 */}
          <div
            onClick={() => applyPresetTemplate("#1B1B24", "#EF4444")}
            className={`group relative rounded-2xl overflow-hidden border cursor-pointer hover:shadow-xl transition-all duration-300 ${
              resolvedPrimary.toUpperCase() === "#1B1B24" && resolvedSecondary.toUpperCase() === "#EF4444" ? "border-[#3525cd] ring-2 ring-[#3525cd]" : "border-gray-100"
            }`}
          >
            <div className="h-40 w-full bg-gray-900 p-4 flex flex-col gap-2 relative overflow-hidden">
              <div className="w-1/2 h-4 bg-white/20 rounded-full"></div>
              <div className="w-full h-2 bg-white/10 rounded-full"></div>
              <div className="w-3/4 h-2 bg-white/10 rounded-full"></div>
              <div className="mt-auto flex justify-between">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[16px]">dark_mode</span>
                </div>
                <div className="flex gap-2">
                  <div className="w-12 h-6 rounded-full bg-white/20"></div>
                  <div className="w-12 h-6 rounded-full bg-white/10"></div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white border-t border-gray-50">
              <h4 className="font-bold text-[#1b1b24]">Midnight Executive</h4>
              <p className="text-xs text-[#777587]">Deep colors, High contrast, OLED-ready</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeCreatePage;
