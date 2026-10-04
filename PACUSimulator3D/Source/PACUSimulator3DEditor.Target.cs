using UnrealBuildTool;
using System.Collections.Generic;

public class PACUSimulator3DEditorTarget : TargetRules
{
    public PACUSimulator3DEditorTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Editor;
        DefaultBuildSettings = BuildSettingsVersion.V5;
        IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
        ExtraModuleNames.Add("PACUSimulator3D");
    }
}
