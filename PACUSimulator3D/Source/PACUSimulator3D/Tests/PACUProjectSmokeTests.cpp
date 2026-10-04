#if WITH_DEV_AUTOMATION_TESTS
#include "Misc/AutomationTest.h"
#include "Modules/ModuleManager.h"

IMPLEMENT_SIMPLE_AUTOMATION_TEST(FPACUProjectSmokeTest,
    "PACU.Project.ModuleLoads",
    EAutomationTestFlags::EditorContext | EAutomationTestFlags::EngineFilter)

bool FPACUProjectSmokeTest::RunTest(const FString& Parameters)
{
    TestTrue(TEXT("PACUSimulator3D module should be loaded"),
        FModuleManager::Get().IsModuleLoaded(TEXT("PACUSimulator3D")));
    return true;
}
#endif
