using UnrealBuildTool;
using System.Collections.Generic;

public class PACUSimulator3DTarget : TargetRules
{
    public PACUSimulator3DTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Game;
        DefaultBuildSettings = BuildSettingsVersion.V5;
        IncludeOrderVersion = EngineIncludeOrderVersion.Latest;
        ExtraModuleNames.Add("PACUSimulator3D");
    }
}
